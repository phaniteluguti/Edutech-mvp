/**
 * User Service
 * Handles user creation, updates, and queries
 */
import { User, UserRole } from '@prisma/client';
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
export declare class UserService {
    /**
     * Create a new user
     */
    createUser(data: CreateUserInput): Promise<User>;
    /**
     * Find user by email
     */
    findByEmail(email: string): Promise<User | null>;
    /**
     * Find user by ID
     */
    findById(id: string): Promise<User | null>;
    /**
     * Update user
     */
    updateUser(id: string, data: UpdateUserInput): Promise<User>;
    /**
     * Update last login timestamp
     */
    updateLastLogin(id: string): Promise<User>;
    /**
     * Mark email as verified
     */
    verifyEmail(id: string): Promise<User>;
    /**
     * Mark phone as verified
     */
    verifyPhone(id: string): Promise<User>;
    /**
     * Record parental consent
     */
    giveParentalConsent(id: string): Promise<User>;
    /**
     * Check if user can access the platform
     * - Adult users need email verification
     * - Minor users need email verification + parental consent
     */
    canAccessPlatform(user: User): Promise<boolean>;
    /**
     * Get all users (admin only)
     */
    getAllUsers(page?: number, limit?: number, filters?: {
        role?: UserRole;
        isMinor?: boolean;
        isActive?: boolean;
    }): Promise<{
        users: User[];
        total: number;
    }>;
    /**
     * Delete user account (soft delete)
     */
    deleteUser(id: string): Promise<User>;
    /**
     * Calculate age from date of birth
     */
    private calculateAge;
}
export declare const userService: UserService;
//# sourceMappingURL=user.service.d.ts.map