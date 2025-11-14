import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import prisma from '../lib/prisma';

const router = Router();

// Update user profile
router.put('/profile', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const { name, phone, dateOfBirth } = req.body;

    // Validate input
    if (!name || name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Name is required'
      });
    }

    // Prepare update data
    const updateData: any = {
      name: name.trim(),
    };

    if (phone !== undefined) {
      updateData.phone = phone ? phone.trim() : null;
    }

    if (dateOfBirth) {
      updateData.dateOfBirth = new Date(dateOfBirth);
      
      // Recalculate isMinor based on new date of birth
      const today = new Date();
      const birthDate = new Date(dateOfBirth);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      updateData.isMinor = age < 18;
    }

    // Update user in database
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        dateOfBirth: true,
        isMinor: true,
        isEmailVerified: true,
        parentEmail: true,
        createdAt: true,
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedUser
    });
  } catch (error: any) {
    console.error('Profile update error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    });
  }
});

// Get user profile
router.get('/profile', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        dateOfBirth: true,
        isMinor: true,
        isEmailVerified: true,
        parentEmail: true,
        createdAt: true,
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: user
    });
  } catch (error: any) {
    console.error('Get profile error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get profile',
      error: error.message
    });
  }
});

export default router;
