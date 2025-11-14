/**
 * User Service
 * Handles user creation, updates, and queries
 */
import { PrismaClient, User, UserRole } from '@prisma/client';
import { hashPassword } from '../lib/password';

const prisma = new PrismaClient();

export interface CreateUserInput {
  email: string;
  password: string;
  name: string;
  phone?: string;
  dateOfBirth?: Date;
  parentEmail?: string;
  marketingConsent?: boolean;
}

export interface UpdateUserInput {
  name?: string;
  phone?: string;
  dateOfBirth?: Date;
  parentEmail?: string;
  isEmailVerified?: boolean;
  isPhoneVerified?: boolean;
  isActive?: boolean;
  parentConsentGiven?: boolean;
  parentConsentAt?: Date;
  marketingConsent?: boolean;
  lastLoginAt?: Date;
}

export class UserService {
  /**
   * Create a new user
   */
  async createUser(data: CreateUserInput): Promise<User> {
    const { password, dateOfBirth, email, ...rest } = data;

    // Normalize email to lowercase
    const normalizedEmail = email.toLowerCase();

    // Hash password
    const passwordHash = await hashPassword(password);

    // Check if user is minor (under 18)
    const isMinor = dateOfBirth ? this.calculateAge(dateOfBirth) < 18 : false;

    // Create user
    try {
      const user = await prisma.user.create({
        data: {
          ...rest,
          email: normalizedEmail,
          passwordHash,
          dateOfBirth,
          isMinor,
          consentGivenAt: new Date(),
          consentVersion: '1.0',
        },
      });

      return user;
    } catch (error: any) {
      // Handle unique constraint violations
      if (error.code === 'P2002') {
        const field = error.meta?.target?.[0];
        if (field === 'email') {
          throw new Error('An account with this email already exists');
        } else if (field === 'phone') {
          throw new Error('An account with this phone number already exists');
        }
        throw new Error('An account with this information already exists');
      }
      throw error;
    }
  }

  /**
   * Find user by email (case-insensitive)
   */
  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        subscriptions: {
          where: { status: 'ACTIVE' },
          orderBy: { endDate: 'desc' },
          take: 1,
        },
      },
    });
  }

  /**
   * Find user by ID
   */
  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
      include: {
        subscriptions: {
          where: { status: 'ACTIVE' },
          orderBy: { endDate: 'desc' },
          take: 1,
        },
      },
    });
  }

  /**
   * Update user
   */
  async updateUser(id: string, data: UpdateUserInput): Promise<User> {
    return prisma.user.update({
      where: { id },
      data,
    });
  }

  /**
   * Update last login timestamp
   */
  async updateLastLogin(id: string): Promise<User> {
    return this.updateUser(id, { lastLoginAt: new Date() });
  }

  /**
   * Mark email as verified
   */
  async verifyEmail(id: string): Promise<User> {
    return this.updateUser(id, { isEmailVerified: true });
  }

  /**
   * Mark phone as verified
   */
  async verifyPhone(id: string): Promise<User> {
    return this.updateUser(id, { isPhoneVerified: true });
  }

  /**
   * Record parental consent
   */
  async giveParentalConsent(id: string): Promise<User> {
    return this.updateUser(id, {
      parentConsentGiven: true,
      parentConsentAt: new Date(),
    });
  }

  /**
   * Check if user can access the platform
   * - Adult users need email verification
   * - Minor users need email verification + parental consent
   */
  async canAccessPlatform(user: User): Promise<boolean> {
    if (!user.isEmailVerified) {
      return false;
    }

    if (user.isMinor && !user.parentConsentGiven) {
      return false;
    }

    if (!user.isActive) {
      return false;
    }

    return true;
  }

  /**
   * Get all users (admin only)
   */
  async getAllUsers(
    page: number = 1,
    limit: number = 20,
    filters?: {
      role?: UserRole;
      isMinor?: boolean;
      isActive?: boolean;
    }
  ): Promise<{ users: User[]; total: number }> {
    const where = filters || {};
    
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          subscriptions: {
            where: { status: 'ACTIVE' },
            take: 1,
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    return { users, total };
  }

  /**
   * Delete user account (soft delete)
   */
  async deleteUser(id: string): Promise<User> {
    return this.updateUser(id, { isActive: false });
  }

  /**
   * Calculate age from date of birth
   */
  private calculateAge(dateOfBirth: Date): number {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }
}

export const userService = new UserService();
