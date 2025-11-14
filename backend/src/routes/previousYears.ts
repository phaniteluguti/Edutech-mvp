import { Router, Request, Response } from 'express';
import prisma from '../utils/prisma';
import { Difficulty } from '@prisma/client';

const router = Router();

/**
 * GET /api/v1/previous-years
 * Fetch previous year questions with filters
 * 
 * Query params:
 * - examType: JEE, NEET, etc.
 * - year: 2023, 2024, etc.
 * - topic: Kinematics, Algebra, etc.
 * - difficulty: EASY, MEDIUM, HARD
 * - limit: number of questions (default: 10)
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const {
      examType,
      year,
      topic,
      difficulty,
      limit = '10',
    } = req.query;

    const where: any = {};
    
    if (examType) where.examType = examType as string;
    if (year) where.year = parseInt(year as string);
    if (topic) where.topic = { contains: topic as string, mode: 'insensitive' };
    if (difficulty) where.difficulty = difficulty as Difficulty;

    const questions = await prisma.previousYearQuestion.findMany({
      where,
      take: parseInt(limit as string),
      orderBy: [
        { year: 'desc' },
        { questionNumber: 'asc' },
      ],
      select: {
        id: true,
        examType: true,
        year: true,
        session: true,
        text: true,
        questionType: true,
        options: true,
        topic: true,
        subtopic: true,
        difficulty: true,
        marks: true,
        frequency: true,
        verificationStatus: true,
      },
    });

    res.json({
      success: true,
      count: questions.length,
      data: questions,
    });
  } catch (error) {
    console.error('Error fetching previous year questions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch previous year questions',
    });
  }
});

/**
 * GET /api/v1/previous-years/stats/overview
 * Get statistics about previous year questions
 */
router.get('/stats/overview', async (req: Request, res: Response) => {
  try {
    const { examType } = req.query;

    const where = examType ? { examType: examType as string } : {};

    const [totalCount, byDifficulty, byYear, topTopics] = await Promise.all([
      // Total count
      prisma.previousYearQuestion.count({ where }),

      // Group by difficulty
      prisma.previousYearQuestion.groupBy({
        by: ['difficulty'],
        where,
        _count: true,
      }),

      // Group by year
      prisma.previousYearQuestion.groupBy({
        by: ['year'],
        where,
        _count: true,
        orderBy: { year: 'desc' },
      }),

      // Top topics by frequency
      prisma.previousYearQuestion.groupBy({
        by: ['topic'],
        where,
        _sum: { frequency: true },
        _count: true,
        orderBy: { _sum: { frequency: 'desc' } },
        take: 10,
      }),
    ]);

    res.json({
      success: true,
      data: {
        totalQuestions: totalCount,
        byDifficulty: byDifficulty.map(d => ({
          difficulty: d.difficulty,
          count: d._count,
        })),
        byYear: byYear.map(y => ({
          year: y.year,
          count: y._count,
        })),
        topTopics: topTopics.map(t => ({
          topic: t.topic,
          questionsCount: t._count,
          totalFrequency: t._sum.frequency || 0,
        })),
      },
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
    });
  }
});

/**
 * GET /api/v1/previous-years/similar/:id
 * Find similar questions for AI context
 * Used by AI service to get context for question generation
 */
router.get('/similar/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { limit = '5' } = req.query;

    const question = await prisma.previousYearQuestion.findUnique({
      where: { id },
      select: { topic: true, difficulty: true, examType: true },
    });

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found',
      });
    }

    // Find similar questions (same topic, similar difficulty, same exam)
    const similarQuestions = await prisma.previousYearQuestion.findMany({
      where: {
        id: { not: id },
        examType: question.examType,
        topic: question.topic,
        difficulty: question.difficulty,
        verificationStatus: 'VERIFIED',
      },
      take: parseInt(limit as string),
      orderBy: { frequency: 'desc' },
    });

    // Mark as used for AI
    await prisma.previousYearQuestion.update({
      where: { id },
      data: {
        usedInAIPrompts: { increment: 1 },
        lastUsedForAI: new Date(),
      },
    });

    res.json({
      success: true,
      count: similarQuestions.length,
      data: similarQuestions,
    });
  } catch (error) {
    console.error('Error finding similar questions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to find similar questions',
    });
  }
});

/**
 * GET /api/v1/previous-years/:id
 * Get single previous year question by ID with full details
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const question = await prisma.previousYearQuestion.findUnique({
      where: { id },
    });

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found',
      });
    }

    res.json({
      success: true,
      data: question,
    });
  } catch (error) {
    console.error('Error fetching question:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch question',
    });
  }
});

/**
 * GET /api/v1/previous-years/stats/overview
 * Get statistics about previous year questions
 */
router.get('/stats/overview', async (req: Request, res: Response) => {
  try {
    const { examType } = req.query;

    const where = examType ? { examType: examType as string } : {};

    const [totalCount, byDifficulty, byYear, topTopics] = await Promise.all([
      // Total count
      prisma.previousYearQuestion.count({ where }),

      // Group by difficulty
      prisma.previousYearQuestion.groupBy({
        by: ['difficulty'],
        where,
        _count: true,
      }),

      // Group by year
      prisma.previousYearQuestion.groupBy({
        by: ['year'],
        where,
        _count: true,
        orderBy: { year: 'desc' },
      }),

      // Top topics by frequency
      prisma.previousYearQuestion.groupBy({
        by: ['topic'],
        where,
        _sum: { frequency: true },
        _count: true,
        orderBy: { _sum: { frequency: 'desc' } },
        take: 10,
      }),
    ]);

    res.json({
      success: true,
      data: {
        totalQuestions: totalCount,
        byDifficulty: byDifficulty.map(d => ({
          difficulty: d.difficulty,
          count: d._count,
        })),
        byYear: byYear.map(y => ({
          year: y.year,
          count: y._count,
        })),
        topTopics: topTopics.map(t => ({
          topic: t.topic,
          questionsCount: t._count,
          totalFrequency: t._sum.frequency || 0,
        })),
      },
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
    });
  }
});

/**
 * GET /api/v1/previous-years/similar/:id
 * Find similar questions for AI context
 * Used by AI service to get context for question generation
 */
router.get('/similar/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { limit = '5' } = req.query;

    const question = await prisma.previousYearQuestion.findUnique({
      where: { id },
      select: { topic: true, difficulty: true, examType: true },
    });

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found',
      });
    }

    // Find similar questions (same topic, similar difficulty, same exam)
    const similarQuestions = await prisma.previousYearQuestion.findMany({
      where: {
        id: { not: id },
        examType: question.examType,
        topic: question.topic,
        difficulty: question.difficulty,
        verificationStatus: 'VERIFIED',
      },
      take: parseInt(limit as string),
      orderBy: { frequency: 'desc' },
    });

    // Mark as used for AI
    await prisma.previousYearQuestion.update({
      where: { id },
      data: {
        usedInAIPrompts: { increment: 1 },
        lastUsedForAI: new Date(),
      },
    });

    res.json({
      success: true,
      count: similarQuestions.length,
      data: similarQuestions,
    });
  } catch (error) {
    console.error('Error finding similar questions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to find similar questions',
    });
  }
});

export default router;
