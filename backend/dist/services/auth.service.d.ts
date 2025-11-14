/**
 * Authentication Service
 * Handles user authentication, token generation, and password management
 */
import { User } from '@prisma/client';
import { CreateUserInput } from './user.service';
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
export declare class AuthService {
    /**
     * Register a new user
     */
    register(data: RegisterInput): Promise<AuthResponse>;
    /**
     * Login user
     */
    login(data: LoginInput): Promise<AuthResponse>;
    /**
     * Verify email with token
     */
    verifyEmail(token: string): Promise<User>;
    /**
     * Process parental consent
     */
    giveParentalConsent(token: string): Promise<User>;
    /**
     * Request password reset
     */
    requestPasswordReset(data: PasswordResetRequest): Promise<void>;
    /**
     * Confirm password reset with token
     */
    resetPassword(data: PasswordResetConfirm): Promise<void>;
    /**
     * Resend email verification
     */
    resendEmailVerification(email: string): Promise<void>;
    /**
     * Get user from JWT token
     */
    getUserFromToken(token: string): Promise<User | null>;
    /**
     * Validate password strength
     */
    private validatePasswordStrength;
    /**
     * Generate random token
     */
    private generateToken;
}
export declare const authService: AuthService;
//# sourceMappingURL=auth.service.d.ts.map