import { Router } from 'express';
import healthRouter from './health';
import previousYearQuestionsRouter from './previousYearQuestions';

const router = Router();

// Health check
router.use('/health', healthRouter);

// API v1 routes
router.use('/api/v1/previous-year-questions', previousYearQuestionsRouter);

export default router;
