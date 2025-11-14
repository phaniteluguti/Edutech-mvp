import { Router, Request, Response } from 'express';
import prisma from '../utils/prisma';

const router = Router();

// GET /api/v1/previous-year-questions
// Fetch previous year questions with filters
router.get('/', async (req: Request, res: Response) => {
  try {
    const {
      examType,
      year,
      topic,
      difficulty,
      limit = '10',
      offset = '0',
    } = req.query;

    const where: any = {};
    
    if (examType) where.examType = examType as string;
    if (year) where.year = parseInt(year as string);
    if (topic) where.topic = { contains: topic as string, mode: 'insensitive' };
    if (difficulty) where.difficulty = difficulty as string;

    const [questions, total] = await Promise.all([
      prisma.previousYearQuestion.findMany({
        where,
        take: parseInt(limit as string),
        skip: parseInt(offset as string),
        orderBy: [
          { year: 'desc' },
          { questionNumber: 'asc' },
        ],
      }),
      prisma.previousYearQuestion.count({ where }),
    ]);

    res.json({
      success: true,
      data: questions,
      pagination: {
        total,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
        hasMore: total > parseInt(offset as string) + parseInt(limit as string),
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch previous year questions',
      error: error.message,
    });
  }
});

// GET /api/v1/previous-year-questions/stats
// Get statistics about previous year questions
router.get('/stats', async (_req: Request, res: Response) => {
  try {
    const [totalCount, examTypes, topicDistribution] = await Promise.all([
      prisma.previousYearQuestion.count(),
      prisma.previousYearQuestion.groupBy({
        by: ['examType'],
        _count: true,
      }),
      prisma.previousYearQuestion.groupBy({
        by: ['topic'],
        _count: true,
        orderBy: {
          _count: {
            topic: 'desc',
          },
        },
        take: 10,
      }),
    ]);

    res.json({
      success: true,
      data: {
        totalQuestions: totalCount,
        byExamType: examTypes.map((e) => ({
          examType: e.examType,
          count: e._count,
        })),
        topTopics: topicDistribution.map((t) => ({
          topic: t.topic,
          count: t._count,
        })),
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: error.message,
    });
  }
});

export default router;
