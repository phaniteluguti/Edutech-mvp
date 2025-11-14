/**
 * Authentication Routes
 * Handles user registration, login, verification, and password management
 */
import { Router, Request, Response } from 'express';
import { authService } from '../services/auth.service';
import { validate } from '../middleware/validate';
import { z } from 'zod';

const router = Router();

// Validation schemas
const registerSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    phone: z.string().min(10, 'Phone number must be at least 10 digits'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
    name: z.string().min(2, 'Name must be at least 2 characters'),
    dateOfBirth: z.string().refine(
      (date) => !isNaN(Date.parse(date)),
      'Invalid date format'
    ),
    parentEmail: z.string().email().optional(),
  }).refine(
    (data) => data.password === data.confirmPassword,
    {
      message: "Passwords don't match",
      path: ["confirmPassword"],
    }
  ),
});

const loginSchema = z.object({
  body: z.object({
    emailOrPhone: z.string().min(1, 'Email or phone is required'),
    password: z.string().min(1, 'Password is required'),
  }),
});

const verifyEmailSchema = z.object({
  body: z.object({
    token: z.string().min(1, 'Token is required'),
  }),
});

const parentalConsentSchema = z.object({
  body: z.object({
    token: z.string().min(1, 'Token is required'),
  }),
});

const passwordResetRequestSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
  }),
});

const passwordResetSchema = z.object({
  body: z.object({
    token: z.string().min(1, 'Token is required'),
    newPassword: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(8, 'Password must be at least 8 characters'),
  }),
});

const resendVerificationSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
  }),
});

const googleOAuthSchema = z.object({
  body: z.object({
    credential: z.string().min(1, 'Google credential is required'),
  }),
});

/**
 * POST /auth/register
 * Register a new user
 */
router.post('/register', validate(registerSchema), async (req: Request, res: Response) => {
  try {
    const { email, phone, password, confirmPassword, name, dateOfBirth, parentEmail } = req.body;

    const authResponse = await authService.register({
      email,
      phone,
      password,
      confirmPassword,
      name,
      dateOfBirth: new Date(dateOfBirth),
      parentEmail,
    });

    const { user } = authResponse;

    res.status(201).json({
      success: true,
      message: user.isMinor
        ? 'Registration successful! Parental consent email sent.'
        : 'Registration successful! Please verify your email.',
      data: authResponse,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Registration failed',
    });
  }
});

/**
 * POST /auth/login
 * User login
 */
router.post('/login', validate(loginSchema), async (req: Request, res: Response) => {
  try {
    const { emailOrPhone, password } = req.body;

    const result = await authService.login({
      email: emailOrPhone,
      password,
    });

    // Set HTTP-only cookie for token
    res.cookie('token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({
      success: true,
      message: 'Login successful',
      data: result,
    });
  } catch (error: any) {
    res.status(401).json({
      success: false,
      message: error.message || 'Login failed',
    });
  }
});

/**
 * POST /auth/logout
 * User logout
 */
router.post('/logout', (_req: Request, res: Response) => {
  res.clearCookie('token');
  res.json({
    success: true,
    message: 'Logout successful',
  });
});

/**
 * POST /auth/verify-email
 * Verify email address
 */
router.post('/verify-email', validate(verifyEmailSchema), async (req: Request, res: Response) => {
  try {
    const { token } = req.body;
    await authService.verifyEmail(token);

    res.json({
      success: true,
      message: 'Email verified successfully',
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Email verification failed',
    });
  }
});

/**
 * POST /auth/parental-consent
 * Give parental consent for minor
 */
router.post('/parental-consent', validate(parentalConsentSchema), async (req: Request, res: Response) => {
  try {
    const { token } = req.body;
    await authService.giveParentalConsent(token);

    res.json({
      success: true,
      message: 'Parental consent recorded successfully',
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Parental consent failed',
    });
  }
});

/**
 * POST /auth/password/reset
 * Request password reset
 */
router.post('/password/reset', validate(passwordResetRequestSchema), async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    await authService.requestPasswordReset({ email });

    res.json({
      success: true,
      message: 'Password reset email sent',
    });
  } catch (error: any) {
    // Always return success to prevent email enumeration
    res.json({
      success: true,
      message: 'If the email exists, a password reset link has been sent',
    });
  }
});

/**
 * POST /auth/password/reset/confirm
 * Reset password with token
 */
router.post('/password/reset/confirm', validate(passwordResetSchema), async (req: Request, res: Response) => {
  try {
    const { token, newPassword, confirmPassword } = req.body;
    await authService.resetPassword({
      token,
      newPassword,
      confirmPassword,
    });

    res.json({
      success: true,
      message: 'Password reset successfully',
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Password reset failed',
    });
  }
});

/**
 * POST /auth/resend-verification
 * Resend email verification
 */
router.post('/resend-verification', validate(resendVerificationSchema), async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    await authService.resendEmailVerification(email);

    res.json({
      success: true,
      message: 'Verification email sent',
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to send verification email',
    });
  }
});

/**
 * POST /auth/oauth/google
 * Authenticate user with Google OAuth
 */
router.post('/oauth/google', validate(googleOAuthSchema), async (req: Request, res: Response) => {
  try {
    const { credential } = req.body;

    const authResponse = await authService.googleOAuth(credential);

    res.json({
      success: true,
      message: 'Google authentication successful',
      data: authResponse,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Google authentication failed',
    });
  }
});

export default router;
