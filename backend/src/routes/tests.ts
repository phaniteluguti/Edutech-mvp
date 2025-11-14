import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { testAttemptService } from '../services/testAttempt.service';
import { timerService } from '../services/timer.service';
import prisma from '../lib/prisma';

const router = Router();

/**
 * GET /api/v1/tests
 * List all available mock tests
 */
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { examId, page = '1', limit = '20' } = req.query;
    
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const take = parseInt(limit as string);

    const where: any = {};
    if (examId) {
      where.examId = examId as string;
    }

    const [tests, total] = await Promise.all([
      prisma.mockTest.findMany({
        where,
        include: {
          exam: true,
          _count: {
            select: {
              attempts: true,
              questions: true
            }
          }
        },
        skip,
        take,
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.mockTest.count({ where })
    ]);

    // Check if user has attempted each test
    const userId = req.user!.userId;
    const testsWithAttemptStatus = await Promise.all(
      tests.map(async (test) => {
        const hasAttempted = await testAttemptService.hasAttempted(userId, test.id);
        return {
          ...test,
          hasAttempted
        };
      })
    );

    res.json({
      success: true,
      data: testsWithAttemptStatus,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        totalPages: Math.ceil(total / parseInt(limit as string))
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * GET /api/v1/tests/my-attempts
 * Get user's test history
 * NOTE: Must be before /:id route to avoid matching conflicts
 */
router.get('/my-attempts', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { examId } = req.query;

    const attempts = await testAttemptService.getUserAttempts(
      userId,
      examId as string | undefined
    );

    res.json({
      success: true,
      data: attempts
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * GET /api/v1/tests/:id
 * Get test details
 */
router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const test = await prisma.mockTest.findUnique({
      where: { id },
      include: {
        exam: true,
        _count: {
          select: {
            attempts: true,
            questions: true
          }
        }
      }
    });

    if (!test) {
      return res.status(404).json({
        success: false,
        message: 'Test not found'
      });
    }

    // Check if user has attempted
    const userId = req.user!.userId;
    const hasAttempted = await testAttemptService.hasAttempted(userId, id);

    res.json({
      success: true,
      data: {
        ...test,
        hasAttempted
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * POST /api/v1/tests/:id/start
 * Start a test attempt
 */
router.post('/:id/start', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    const attempt = await testAttemptService.startAttempt(userId, id);

    res.json({
      success: true,
      data: attempt,
      message: 'Test started successfully'
    });
  } catch (error: any) {
    const status = error.message.includes('already submitted') ? 400 : 500;
    res.status(status).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * GET /api/v1/tests/attempts/:id
 * Get attempt status and current state
 */
router.get('/attempts/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    const attempt = await testAttemptService.getAttemptById(id, userId);

    // Calculate remaining time
    let remainingTime = null;
    if (attempt.status === 'IN_PROGRESS' && attempt.startedAt) {
      remainingTime = timerService.getRemainingTime(
        attempt.startedAt,
        attempt.mockTest.duration
      );
    }

    res.json({
      success: true,
      data: {
        ...attempt,
        serverTime: timerService.getServerTime(),
        remainingTime
      }
    });
  } catch (error: any) {
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * PUT /api/v1/tests/attempts/:id/responses
 * Save answer (for auto-save)
 */
router.put('/attempts/:id/responses', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    const { questionId, answer, syncVersion } = req.body;

    if (!questionId) {
      return res.status(400).json({
        success: false,
        message: 'Question ID is required'
      });
    }

    const attempt = await testAttemptService.saveResponse(
      id,
      userId,
      questionId,
      answer,
      syncVersion
    );

    res.json({
      success: true,
      data: {
        syncVersion: attempt.syncVersion,
        lastSyncedAt: attempt.lastSyncedAt
      },
      message: 'Response saved successfully'
    });
  } catch (error: any) {
    if (error.message.includes('SYNC_CONFLICT')) {
      return res.status(409).json({
        success: false,
        message: 'Sync conflict detected. Please refresh.',
        code: 'SYNC_CONFLICT'
      });
    }

    const status = error.message.includes('Cannot modify') ? 400 : 500;
    res.status(status).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * POST /api/v1/tests/attempts/:id/submit
 * Submit test
 */
router.post('/attempts/:id/submit', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    const submitted = await testAttemptService.submitAttempt(id, userId);

    res.json({
      success: true,
      data: submitted,
      message: 'Test submitted successfully'
    });
  } catch (error: any) {
    const status = error.message.includes('already submitted') ? 400 : 500;
    res.status(status).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * GET /api/v1/tests/attempts/:id/results
 * Get detailed results
 */
router.get('/attempts/:id/results', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    const results = await testAttemptService.getAttemptResults(id, userId);

    res.json({
      success: true,
      data: results
    });
  } catch (error: any) {
    const status = error.message.includes('not yet submitted') ? 400 : 404;
    res.status(status).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * POST /api/v1/tests/cleanup-attempts
 * Cleanup test attempts for a user (for testing purposes)
 */
router.post('/cleanup-attempts', async (req, res: Response) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Delete all test attempts for this user
    const deleted = await prisma.testAttempt.deleteMany({
      where: { userId: user.id }
    });

    res.json({
      success: true,
      message: `Deleted ${deleted.count} test attempt(s)`,
      data: { count: deleted.count }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;
