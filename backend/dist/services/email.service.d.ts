export declare class EmailService {
    /**
     * Send email verification
     */
    sendEmailVerification(email: string, token: string): Promise<void>;
    /**
     * Send parental consent email
     */
    sendParentalConsent(parentEmail: string, studentName: string, token: string): Promise<void>;
    /**
     * Send consent confirmation to student
     */
    sendConsentConfirmation(email: string, name: string): Promise<void>;
    /**
     * Send password reset email
     */
    sendPasswordReset(email: string, token: string): Promise<void>;
    /**
     * Send password reset confirmation
     */
    sendPasswordResetConfirmation(email: string): Promise<void>;
}
export declare const emailService: EmailService;
//# sourceMappingURL=email.service.d.ts.map