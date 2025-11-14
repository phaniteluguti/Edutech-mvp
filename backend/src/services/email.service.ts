/**
 * Email Service
 * Handles sending emails using Nodemailer
 */
import nodemailer from 'nodemailer';
import { config } from '../config/env';

// Email configuration
// For development, use ethereal email (test account) if SMTP credentials not configured
let transporter: nodemailer.Transporter;

const initTransporter = async () => {
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  // If SMTP credentials are configured, use them
  if (smtpUser && smtpPass && !smtpUser.includes('your-email')) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });
  } else {
    // Development mode: create ethereal test account
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    console.log('📧 Using Ethereal Email for testing');
    console.log(`Preview emails at: https://ethereal.email`);
  }
};

// Initialize transporter
initTransporter().catch(console.error);

const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@edutech.com';
const FROM_NAME = process.env.FROM_NAME || 'EduTech Platform';
const FRONTEND_URL = config.FRONTEND_URL;

export class EmailService {
  /**
   * Ensure transporter is initialized
   */
  private async ensureTransporter(): Promise<void> {
    if (!transporter) {
      await initTransporter();
    }
  }

  /**
   * Send email verification
   */
  async sendEmailVerification(email: string, token: string): Promise<void> {
    await this.ensureTransporter();
    const verificationUrl = `${FRONTEND_URL}/auth/verify-email?token=${token}`;

    await transporter.sendMail({
      from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
      to: email,
      subject: 'Verify Your Email - EduTech Platform',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎓 Welcome to EduTech!</h1>
            </div>
            <div class="content">
              <h2>Verify Your Email Address</h2>
              <p>Thank you for registering with EduTech Platform. Please verify your email address by clicking the button below:</p>
              <p style="text-align: center;">
                <a href="${verificationUrl}" class="button">Verify Email</a>
              </p>
              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #667eea;">${verificationUrl}</p>
              <p><strong>This link will expire in 24 hours.</strong></p>
              <p>If you didn't create an account, please ignore this email.</p>
            </div>
            <div class="footer">
              <p>© 2025 EduTech Platform. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });
  }

  /**
   * Send parental consent email
   */
  async sendParentalConsent(
    parentEmail: string,
    studentName: string,
    token: string
  ): Promise<void> {
    await this.ensureTransporter();
    const consentUrl = `${FRONTEND_URL}/auth/parental-consent?token=${token}`;

    await transporter.sendMail({
      from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
      to: parentEmail,
      subject: `Parental Consent Required for ${studentName} - EduTech Platform`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .alert { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>👨‍👩‍👧 Parental Consent Required</h1>
            </div>
            <div class="content">
              <h2>Dear Parent/Guardian,</h2>
              <p><strong>${studentName}</strong> has registered for an account on EduTech Platform.</p>
              <div class="alert">
                <strong>DPDP Act Compliance:</strong> As ${studentName} is under 18 years of age, we require your consent before they can access our platform.
              </div>
              <p>By providing your consent, you:</p>
              <ul>
                <li>Allow ${studentName} to create and use an account on EduTech Platform</li>
                <li>Agree to our Terms of Service and Privacy Policy</li>
                <li>Acknowledge that ${studentName}'s data will be processed as per our Privacy Policy</li>
              </ul>
              <p style="text-align: center;">
                <a href="${consentUrl}" class="button">Give Parental Consent</a>
              </p>
              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #667eea;">${consentUrl}</p>
              <p><strong>This link will expire in 7 days.</strong></p>
              <p>If you have any questions or concerns, please contact us at support@edutech.com</p>
            </div>
            <div class="footer">
              <p>© 2025 EduTech Platform. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });
  }

  /**
   * Send consent confirmation to student
   */
  async sendConsentConfirmation(email: string, name: string): Promise<void> {
    await this.ensureTransporter();
    await transporter.sendMail({
      from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
      to: email,
      subject: 'Parental Consent Received - EduTech Platform',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 12px 30px; background: #10b981; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ You're All Set!</h1>
            </div>
            <div class="content">
              <h2>Hi ${name},</h2>
              <p>Great news! Your parent/guardian has given consent for you to use EduTech Platform.</p>
              <p>You can now access all features of our platform:</p>
              <ul>
                <li>📝 Take practice tests</li>
                <li>🧠 AI-generated questions</li>
                <li>📊 Track your progress</li>
                <li>🎯 Personalized recommendations</li>
              </ul>
              <p style="text-align: center;">
                <a href="${FRONTEND_URL}" class="button">Start Learning</a>
              </p>
            </div>
            <div class="footer">
              <p>© 2025 EduTech Platform. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });
  }

  /**
   * Send password reset email
   */
  async sendPasswordReset(email: string, token: string): Promise<void> {
    await this.ensureTransporter();
    const resetUrl = `${FRONTEND_URL}/auth/reset-password?token=${token}`;

    await transporter.sendMail({
      from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
      to: email,
      subject: 'Password Reset Request - EduTech Platform',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 12px 30px; background: #ef4444; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .alert { background: #fee2e2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Password Reset Request</h1>
            </div>
            <div class="content">
              <h2>Reset Your Password</h2>
              <p>We received a request to reset your password. Click the button below to create a new password:</p>
              <p style="text-align: center;">
                <a href="${resetUrl}" class="button">Reset Password</a>
              </p>
              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #ef4444;">${resetUrl}</p>
              <div class="alert">
                <strong>Security Notice:</strong> This link will expire in 1 hour for security reasons.
              </div>
              <p>If you didn't request a password reset, please ignore this email or contact us if you have concerns.</p>
            </div>
            <div class="footer">
              <p>© 2025 EduTech Platform. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });
  }

  /**
   * Send password reset confirmation
   */
  async sendPasswordResetConfirmation(email: string): Promise<void> {
    await this.ensureTransporter();
    await transporter.sendMail({
      from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
      to: email,
      subject: 'Password Successfully Reset - EduTech Platform',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 12px 30px; background: #10b981; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Password Reset Successful</h1>
            </div>
            <div class="content">
              <h2>Your Password Has Been Reset</h2>
              <p>Your password was successfully reset. You can now log in with your new password.</p>
              <p style="text-align: center;">
                <a href="${FRONTEND_URL}/auth/login" class="button">Log In</a>
              </p>
              <p>If you didn't make this change, please contact us immediately at support@edutech.com</p>
            </div>
            <div class="footer">
              <p>© 2025 EduTech Platform. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });
  }
}

export const emailService = new EmailService();
