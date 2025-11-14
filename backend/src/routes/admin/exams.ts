/**
 * Admin Exam Routes
 * Admin-only endpoints for exam management
 */
import { Router, Response } from 'express';
import { examService } from '../../services/exam.service';
import { requireAdmin, AuthenticatedRequest } from '../../middleware/adminAuth';
import { authenticate } from '../../middleware/auth';

const router = Router();

// Apply authentication and admin authorization to all routes
router.use(authenticate);
router.use(requireAdmin);

/**
 * GET /api/v1/admin/exams
 * Get all exams (including inactive)
 */
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const exams = await examService.getAllExams(false);

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
 * POST /api/v1/admin/exams
 * Create a new exam
 */
router.post('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      name,
      slug,
      description,
      syllabus,
      pattern,
      duration,
      totalMarks,
      negativeMarking,
    } = req.body;

    // Validation
    if (!name || !slug || !syllabus || !pattern || !duration || !totalMarks) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: name, slug, syllabus, pattern, duration, totalMarks',
      });
    }

    const exam = await examService.createExam({
      name,
      slug,
      description,
      syllabus,
      pattern,
      duration,
      totalMarks,
      negativeMarking,
    });

    res.status(201).json({
      success: true,
      data: exam,
      message: 'Exam created successfully',
    });
  } catch (error: any) {
    console.error('Error creating exam:', error);
    
    if (error.message.includes('already exists')) {
      return res.status(409).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create exam',
      error: error.message,
    });
  }
});

/**
 * PUT /api/v1/admin/exams/:id
 * Update an exam
 */
router.put('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Check if exam exists
    const existingExam = await examService.getExamById(id);
    if (!existingExam) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found',
      });
    }

    const exam = await examService.updateExam(id, updateData);

    res.json({
      success: true,
      data: exam,
      message: 'Exam updated successfully',
    });
  } catch (error: any) {
    console.error('Error updating exam:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update exam',
      error: error.message,
    });
  }
});

/**
 * DELETE /api/v1/admin/exams/:id
 * Soft delete an exam (set isActive = false)
 */
router.delete('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Check if exam exists
    const existingExam = await examService.getExamById(id);
    if (!existingExam) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found',
      });
    }

    const exam = await examService.deleteExam(id);

    res.json({
      success: true,
      data: exam,
      message: 'Exam deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting exam:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete exam',
      error: error.message,
    });
  }
});

export default router;
