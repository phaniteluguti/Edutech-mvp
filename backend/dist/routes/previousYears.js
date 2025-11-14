"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = __importDefault(require("../utils/prisma"));
const router = (0, express_1.Router)();
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
router.get('/', async (req, res) => {
    try {
        const { examType, year, topic, difficulty, limit = '10', } = req.query;
        const where = {};
        if (examType)
            where.examType = examType;
        if (year)
            where.year = parseInt(year);
        if (topic)
            where.topic = { contains: topic, mode: 'insensitive' };
        if (difficulty)
            where.difficulty = difficulty;
        const questions = await prisma_1.default.previousYearQuestion.findMany({
            where,
            take: parseInt(limit),
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
    }
    catch (error) {
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
router.get('/stats/overview', async (req, res) => {
    try {
        const { examType } = req.query;
        const where = examType ? { examType: examType } : {};
        const [totalCount, byDifficulty, byYear, topTopics] = await Promise.all([
            // Total count
            prisma_1.default.previousYearQuestion.count({ where }),
            // Group by difficulty
            prisma_1.default.previousYearQuestion.groupBy({
                by: ['difficulty'],
                where,
                _count: true,
            }),
            // Group by year
            prisma_1.default.previousYearQuestion.groupBy({
                by: ['year'],
                where,
                _count: true,
                orderBy: { year: 'desc' },
            }),
            // Top topics by frequency
            prisma_1.default.previousYearQuestion.groupBy({
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
    }
    catch (error) {
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
router.get('/similar/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { limit = '5' } = req.query;
        const question = await prisma_1.default.previousYearQuestion.findUnique({
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
        const similarQuestions = await prisma_1.default.previousYearQuestion.findMany({
            where: {
                id: { not: id },
                examType: question.examType,
                topic: question.topic,
                difficulty: question.difficulty,
                verificationStatus: 'VERIFIED',
            },
            take: parseInt(limit),
            orderBy: { frequency: 'desc' },
        });
        // Mark as used for AI
        await prisma_1.default.previousYearQuestion.update({
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
    }
    catch (error) {
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
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const question = await prisma_1.default.previousYearQuestion.findUnique({
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
    }
    catch (error) {
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
router.get('/stats/overview', async (req, res) => {
    try {
        const { examType } = req.query;
        const where = examType ? { examType: examType } : {};
        const [totalCount, byDifficulty, byYear, topTopics] = await Promise.all([
            // Total count
            prisma_1.default.previousYearQuestion.count({ where }),
            // Group by difficulty
            prisma_1.default.previousYearQuestion.groupBy({
                by: ['difficulty'],
                where,
                _count: true,
            }),
            // Group by year
            prisma_1.default.previousYearQuestion.groupBy({
                by: ['year'],
                where,
                _count: true,
                orderBy: { year: 'desc' },
            }),
            // Top topics by frequency
            prisma_1.default.previousYearQuestion.groupBy({
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
    }
    catch (error) {
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
router.get('/similar/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { limit = '5' } = req.query;
        const question = await prisma_1.default.previousYearQuestion.findUnique({
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
        const similarQuestions = await prisma_1.default.previousYearQuestion.findMany({
            where: {
                id: { not: id },
                examType: question.examType,
                topic: question.topic,
                difficulty: question.difficulty,
                verificationStatus: 'VERIFIED',
            },
            take: parseInt(limit),
            orderBy: { frequency: 'desc' },
        });
        // Mark as used for AI
        await prisma_1.default.previousYearQuestion.update({
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
    }
    catch (error) {
        console.error('Error finding similar questions:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to find similar questions',
        });
    }
});
exports.default = router;
//# sourceMappingURL=previousYears.js.map