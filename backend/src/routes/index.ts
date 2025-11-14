import { Router } from 'express';
import healthRouter from './health';
import previousYearQuestionsRouter from './previousYearQuestions';
import authRouter from './auth';
import examsRouter from './exams';
import adminExamsRouter from './admin/exams';

const router = Router();

// Health check
router.use('/health', healthRouter);

// API v1 routes
router.use('/api/v1/auth', authRouter);
router.use('/api/v1/previous-year-questions', previousYearQuestionsRouter);
router.use('/api/v1/exams', examsRouter);
router.use('/api/v1/admin/exams', adminExamsRouter);

export default router;
