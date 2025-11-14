/**
 * Authentication Service
 * Handles user authentication, token generation, and password management
 */
import { User } from '@prisma/client';
import { comparePassword, hashPassword } from '../lib/password';
import { generateToken, verifyToken } from '../lib/jwt';
import { userService, CreateUserInput } from './user.service';
import { emailService } from './email.service';
import prisma from '../lib/prisma';
import crypto from 'crypto';
import { OAuth2Client } from 'google-auth-library';

export interface RegisterInput extends CreateUserInput {
  confirmPassword: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: Omit<User, 'passwordHash'>;
  token: string;
  requiresEmailVerification?: boolean;
  requiresParentalConsent?: boolean;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirm {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

// In-memory store for tokens (in production, use Redis)
const emailVerificationTokens = new Map<string, { userId: string; expiresAt: number }>();
const passwordResetTokens = new Map<string, { userId: string; expiresAt: number }>();
const parentalConsentTokens = new Map<string, { userId: string; expiresAt: number }>();

export class AuthService {
  /**
   * Register a new user
   */
  async register(data: RegisterInput): Promise<AuthResponse> {
    const { confirmPassword, ...userData } = data;

    // Validate passwords match
    if (data.password !== confirmPassword) {
      throw new Error('Passwords do not match');
    }

    // Validate password strength
    this.validatePasswordStrength(data.password);

    // Check if user already exists
    const existingUser = await userService.findByEmail(data.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Create user
    const user = await userService.createUser(userData);

    // Generate email verification token
    const verificationToken = this.generateToken();
    emailVerificationTokens.set(verificationToken, {
      userId: user.id,
      expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    });

    // Send verification email
    await emailService.sendEmailVerification(user.email, verificationToken);

    // If minor, send parental consent email
    if (user.isMinor && user.parentEmail) {
      const consentToken = this.generateToken();
      parentalConsentTokens.set(consentToken, {
        userId: user.id,
        expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
      });
      await emailService.sendParentalConsent(
        user.parentEmail,
        user.name,
        consentToken
      );
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Remove sensitive data
    const { passwordHash, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      token,
      requiresEmailVerification: !user.isEmailVerified,
      requiresParentalConsent: user.isMinor && !user.parentConsentGiven,
    };
  }

  /**
   * Login user
   */
  async login(data: LoginInput): Promise<AuthResponse> {
    // Find user
    const user = await userService.findByEmail(data.email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await comparePassword(data.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // Check if account is active
    if (!user.isActive) {
      throw new Error('Account is deactivated');
    }

    // Update last login
    await userService.updateLastLogin(user.id);

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Remove sensitive data
    const { passwordHash, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      token,
      requiresEmailVerification: !user.isEmailVerified,
      requiresParentalConsent: user.isMinor && !user.parentConsentGiven,
    };
  }

  /**
   * Verify email with token
   */
  async verifyEmail(token: string): Promise<User> {
    const data = emailVerificationTokens.get(token);
    
    if (!data) {
      throw new Error('Invalid or expired verification token');
    }

    if (Date.now() > data.expiresAt) {
      emailVerificationTokens.delete(token);
      throw new Error('Verification token has expired');
    }

    // Mark email as verified
    const user = await userService.verifyEmail(data.userId);
    
    // Remove token
    emailVerificationTokens.delete(token);

    return user;
  }

  /**
   * Process parental consent
   */
  async giveParentalConsent(token: string): Promise<User> {
    const data = parentalConsentTokens.get(token);
    
    if (!data) {
      throw new Error('Invalid or expired consent token');
    }

    if (Date.now() > data.expiresAt) {
      parentalConsentTokens.delete(token);
      throw new Error('Consent token has expired');
    }

    // Record parental consent
    const user = await userService.giveParentalConsent(data.userId);
    
    // Remove token
    parentalConsentTokens.delete(token);

    // Send confirmation email to student
    await emailService.sendConsentConfirmation(user.email, user.name);

    return user;
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(data: PasswordResetRequest): Promise<void> {
    const user = await userService.findByEmail(data.email);
    
    // Don't reveal if user exists or not (security best practice)
    if (!user) {
      return;
    }

    // Generate reset token
    const resetToken = this.generateToken();
    passwordResetTokens.set(resetToken, {
      userId: user.id,
      expiresAt: Date.now() + 1 * 60 * 60 * 1000, // 1 hour
    });

    // Send password reset email
    await emailService.sendPasswordReset(user.email, resetToken);
  }

  /**
   * Confirm password reset with token
   */
  async resetPassword(data: PasswordResetConfirm): Promise<void> {
    const { token, newPassword, confirmPassword } = data;

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      throw new Error('Passwords do not match');
    }

    // Validate password strength
    this.validatePasswordStrength(newPassword);

    // Verify token
    const tokenData = passwordResetTokens.get(token);
    if (!tokenData) {
      throw new Error('Invalid or expired reset token');
    }

    if (Date.now() > tokenData.expiresAt) {
      passwordResetTokens.delete(token);
      throw new Error('Reset token has expired');
    }

    // Update password directly via Prisma
    const passwordHash = await hashPassword(newPassword);
    await prisma.user.update({
      where: { id: tokenData.userId },
      data: { passwordHash }
    });

    // Remove token
    passwordResetTokens.delete(token);

    // Send confirmation email
    const user = await userService.findById(tokenData.userId);
    if (user) {
      await emailService.sendPasswordResetConfirmation(user.email);
    }
  }

  /**
   * Resend email verification
   */
  async resendEmailVerification(email: string): Promise<void> {
    const user = await userService.findByEmail(email);
    
    if (!user) {
      throw new Error('User not found');
    }

    if (user.isEmailVerified) {
      throw new Error('Email is already verified');
    }

    // Generate new verification token
    const verificationToken = this.generateToken();
    emailVerificationTokens.set(verificationToken, {
      userId: user.id,
      expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    });

    // Send verification email
    await emailService.sendEmailVerification(user.email, verificationToken);
  }

  /**
   * Get user from JWT token
   */
  async getUserFromToken(token: string): Promise<User | null> {
    try {
      const payload = verifyToken(token);
      if (!payload || !payload.userId) {
        return null;
      }

      return userService.findById(payload.userId);
    } catch (error) {
      return null;
    }
  }

  /**
   * Validate password strength
   */
  private validatePasswordStrength(password: string): void {
    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }

    if (!/[a-z]/.test(password)) {
      throw new Error('Password must contain at least one lowercase letter');
    }

    if (!/[A-Z]/.test(password)) {
      throw new Error('Password must contain at least one uppercase letter');
    }

    if (!/[0-9]/.test(password)) {
      throw new Error('Password must contain at least one number');
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      throw new Error('Password must contain at least one special character');
    }
  }

  /**
   * Generate random token
   */
  private generateToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Authenticate user with Google OAuth
   */
  async googleOAuth(credential: string): Promise<AuthResponse> {
    try {
      const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
      
      // Verify the Google credential token
      const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      if (!payload || !payload.email) {
        throw new Error('Invalid Google credential');
      }

      const { email, name, picture, sub: googleId } = payload;

      // Check if user exists
      let user = await userService.findByEmail(email);

      if (!user) {
        // Create new user with Google OAuth
        // Generate a random password (user won't use it)
        const randomPassword = crypto.randomBytes(32).toString('hex');
        
        user = await userService.createUser({
          email,
          name: name || email.split('@')[0],
          password: randomPassword,
          phone: '', // Optional for OAuth users
          dateOfBirth: new Date('2000-01-01'), // Default date, can be updated later
          parentEmail: undefined,
        });

        // Mark email as verified for OAuth users
        await prisma.user.update({
          where: { id: user.id },
          data: { 
            isEmailVerified: true,
            googleId: googleId,
          },
        });

        user = await prisma.user.findUnique({ where: { id: user.id } }) as User;
      } else if (!user.googleId) {
        // Link Google account to existing user
        await prisma.user.update({
          where: { id: user.id },
          data: { 
            googleId: googleId,
            isEmailVerified: true, // Auto-verify email for Google users
          },
        });

        user = await prisma.user.findUnique({ where: { id: user.id } }) as User;
      }

      // Generate JWT token
      const token = generateToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      // Remove sensitive data
      const { passwordHash, ...userWithoutPassword } = user;

      return {
        user: userWithoutPassword,
        token,
        requiresEmailVerification: false, // Google OAuth users are auto-verified
      };
    } catch (error: any) {
      console.error('Google OAuth error:', error);
      throw new Error('Failed to authenticate with Google');
    }
  }
}

export const authService = new AuthService();
