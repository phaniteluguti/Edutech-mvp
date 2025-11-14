"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userService = exports.UserService = void 0;
/**
 * User Service
 * Handles user creation, updates, and queries
 */
const client_1 = require("@prisma/client");
const password_1 = require("../lib/password");
const prisma = new client_1.PrismaClient();
class UserService {
    /**
     * Create a new user
     */
    async createUser(data) {
        const { password, dateOfBirth, ...rest } = data;
        // Hash password
        const passwordHash = await (0, password_1.hashPassword)(password);
        // Check if user is minor (under 18)
        const isMinor = dateOfBirth ? this.calculateAge(dateOfBirth) < 18 : false;
        // Create user
        const user = await prisma.user.create({
            data: {
                ...rest,
                passwordHash,
                dateOfBirth,
                isMinor,
                consentGivenAt: new Date(),
                consentVersion: '1.0',
            },
        });
        return user;
    }
    /**
     * Find user by email
     */
    async findByEmail(email) {
        return prisma.user.findUnique({
            where: { email },
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
    async findById(id) {
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
    async updateUser(id, data) {
        return prisma.user.update({
            where: { id },
            data,
        });
    }
    /**
     * Update last login timestamp
     */
    async updateLastLogin(id) {
        return this.updateUser(id, { lastLoginAt: new Date() });
    }
    /**
     * Mark email as verified
     */
    async verifyEmail(id) {
        return this.updateUser(id, { isEmailVerified: true });
    }
    /**
     * Mark phone as verified
     */
    async verifyPhone(id) {
        return this.updateUser(id, { isPhoneVerified: true });
    }
    /**
     * Record parental consent
     */
    async giveParentalConsent(id) {
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
    async canAccessPlatform(user) {
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
    async getAllUsers(page = 1, limit = 20, filters) {
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
    async deleteUser(id) {
        return this.updateUser(id, { isActive: false });
    }
    /**
     * Calculate age from date of birth
     */
    calculateAge(dateOfBirth) {
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
exports.UserService = UserService;
exports.userService = new UserService();
//# sourceMappingURL=user.service.js.map