/**
 * Exam Routes
 * Public endpoints for exam browsing
 */
import { Router, Request, Response } from 'express';
import { examService } from '../services/exam.service';

const router = Router();

/**
 * GET /api/v1/exams
 * Get all active exams
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const exams = await examService.getAllExams(true);

    res.json({
      success: true,
      data: exams,
      message: 'Exams retrieved successfully',
    });
  } catch (error: any) {
    console.error('Error fetching exams:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch exams',
      error: error.message,
    });
  }
});

/**
 * GET /api/v1/exams/:id
 * Get exam details by ID
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const exam = await examService.getExamById(id);

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found',
      });
    }

    // Get exam statistics
    const stats = await examService.getExamStats(id);

    res.json({
      success: true,
      data: {
        ...exam,
        stats,
      },
      message: 'Exam retrieved successfully',
    });
  } catch (error: any) {
    console.error('Error fetching exam:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch exam',
      error: error.message,
    });
  }
});

/**
 * GET /api/v1/exams/slug/:slug
 * Get exam by slug
 */
router.get('/slug/:slug', async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const exam = await examService.getExamBySlug(slug);

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found',
      });
    }

    res.json({
      success: true,
      data: exam,
      message: 'Exam retrieved successfully',
    });
  } catch (error: any) {
    console.error('Error fetching exam:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch exam',
      error: error.message,
    });
  }
});

export default router;
