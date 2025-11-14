import rateLimit from 'express-rate-limit';

// Skip rate limiting in test/development environment
const isTestEnv = process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development';

// General API rate limiter
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isTestEnv ? 10000 : 100, // Much higher limit for testing
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => isTestEnv, // Skip rate limiting entirely in test/dev
});

// Auth endpoints rate limiter (stricter)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isTestEnv ? 10000 : 5, // Much higher limit for testing
  message: 'Too many authentication attempts, please try again later.',
  skipSuccessfulRequests: true,
  skip: () => isTestEnv, // Skip rate limiting entirely in test/dev
});

// Test submission rate limiter
export const testSubmitLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: isTestEnv ? 10000 : 10, // Much higher limit for testing
  message: 'Too many test submissions, please try again later.',
  skip: () => isTestEnv, // Skip rate limiting entirely in test/dev
});
