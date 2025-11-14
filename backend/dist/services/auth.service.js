"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = exports.AuthService = void 0;
const password_1 = require("../lib/password");
const jwt_1 = require("../lib/jwt");
const user_service_1 = require("./user.service");
const email_service_1 = require("./email.service");
const prisma_1 = __importDefault(require("../lib/prisma"));
const crypto_1 = __importDefault(require("crypto"));
// In-memory store for tokens (in production, use Redis)
const emailVerificationTokens = new Map();
const passwordResetTokens = new Map();
const parentalConsentTokens = new Map();
class AuthService {
    /**
     * Register a new user
     */
    async register(data) {
        const { confirmPassword, ...userData } = data;
        // Validate passwords match
        if (data.password !== confirmPassword) {
            throw new Error('Passwords do not match');
        }
        // Validate password strength
        this.validatePasswordStrength(data.password);
        // Check if user already exists
        const existingUser = await user_service_1.userService.findByEmail(data.email);
        if (existingUser) {
            throw new Error('User with this email already exists');
        }
        // Create user
        const user = await user_service_1.userService.createUser(userData);
        // Generate email verification token
        const verificationToken = this.generateToken();
        emailVerificationTokens.set(verificationToken, {
            userId: user.id,
            expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
        });
        // Send verification email
        await email_service_1.emailService.sendEmailVerification(user.email, verificationToken);
        // If minor, send parental consent email
        if (user.isMinor && user.parentEmail) {
            const consentToken = this.generateToken();
            parentalConsentTokens.set(consentToken, {
                userId: user.id,
                expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
            });
            await email_service_1.emailService.sendParentalConsent(user.parentEmail, user.name, consentToken);
        }
        // Generate JWT token
        const token = (0, jwt_1.generateToken)({
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
    async login(data) {
        // Find user
        const user = await user_service_1.userService.findByEmail(data.email);
        if (!user) {
            throw new Error('Invalid email or password');
        }
        // Verify password
        const isPasswordValid = await (0, password_1.comparePassword)(data.password, user.passwordHash);
        if (!isPasswordValid) {
            throw new Error('Invalid email or password');
        }
        // Check if account is active
        if (!user.isActive) {
            throw new Error('Account is deactivated');
        }
        // Update last login
        await user_service_1.userService.updateLastLogin(user.id);
        // Generate JWT token
        const token = (0, jwt_1.generateToken)({
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
    async verifyEmail(token) {
        const data = emailVerificationTokens.get(token);
        if (!data) {
            throw new Error('Invalid or expired verification token');
        }
        if (Date.now() > data.expiresAt) {
            emailVerificationTokens.delete(token);
            throw new Error('Verification token has expired');
        }
        // Mark email as verified
        const user = await user_service_1.userService.verifyEmail(data.userId);
        // Remove token
        emailVerificationTokens.delete(token);
        return user;
    }
    /**
     * Process parental consent
     */
    async giveParentalConsent(token) {
        const data = parentalConsentTokens.get(token);
        if (!data) {
            throw new Error('Invalid or expired consent token');
        }
        if (Date.now() > data.expiresAt) {
            parentalConsentTokens.delete(token);
            throw new Error('Consent token has expired');
        }
        // Record parental consent
        const user = await user_service_1.userService.giveParentalConsent(data.userId);
        // Remove token
        parentalConsentTokens.delete(token);
        // Send confirmation email to student
        await email_service_1.emailService.sendConsentConfirmation(user.email, user.name);
        return user;
    }
    /**
     * Request password reset
     */
    async requestPasswordReset(data) {
        const user = await user_service_1.userService.findByEmail(data.email);
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
        await email_service_1.emailService.sendPasswordReset(user.email, resetToken);
    }
    /**
     * Confirm password reset with token
     */
    async resetPassword(data) {
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
        const passwordHash = await (0, password_1.hashPassword)(newPassword);
        await prisma_1.default.user.update({
            where: { id: tokenData.userId },
            data: { passwordHash }
        });
        // Remove token
        passwordResetTokens.delete(token);
        // Send confirmation email
        const user = await user_service_1.userService.findById(tokenData.userId);
        if (user) {
            await email_service_1.emailService.sendPasswordResetConfirmation(user.email);
        }
    }
    /**
     * Resend email verification
     */
    async resendEmailVerification(email) {
        const user = await user_service_1.userService.findByEmail(email);
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
        await email_service_1.emailService.sendEmailVerification(user.email, verificationToken);
    }
    /**
     * Get user from JWT token
     */
    async getUserFromToken(token) {
        try {
            const payload = (0, jwt_1.verifyToken)(token);
            if (!payload || !payload.userId) {
                return null;
            }
            return user_service_1.userService.findById(payload.userId);
        }
        catch (error) {
            return null;
        }
    }
    /**
     * Validate password strength
     */
    validatePasswordStrength(password) {
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
    generateToken() {
        return crypto_1.default.randomBytes(32).toString('hex');
    }
}
exports.AuthService = AuthService;
exports.authService = new AuthService();
//# sourceMappingURL=auth.service.js.map