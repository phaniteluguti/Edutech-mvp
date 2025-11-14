/**
 * Admin Authorization Middleware
 * Ensures only admin users can access certain routes
 */
import { Request, Response, NextFunction } from 'express';
import { UserRole } from '@prisma/client';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: UserRole;
  };
}

/**
 * Middleware to check if user has admin role
 */
export const requireAdmin = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'Authentication required',
    });
    return;
  }

  if (req.user.role !== UserRole.ADMIN) {
    res.status(403).json({
      success: false,
      message: 'Admin access required',
    });
    return;
  }

  next();
};

/**
 * Middleware to check if user has admin or SME role
 */
export const requireAdminOrSME = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'Authentication required',
    });
    return;
  }

  if (req.user.role !== UserRole.ADMIN && req.user.role !== UserRole.SME) {
    res.status(403).json({
      success: false,
      message: 'Admin or SME access required',
    });
    return;
  }

  next();
};
