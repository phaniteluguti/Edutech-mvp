"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = __importDefault(require("../utils/prisma"));
const router = (0, express_1.Router)();
// GET /api/v1/previous-year-questions
// Fetch previous year questions with filters
router.get('/', async (req, res) => {
    try {
        const { examType, year, topic, difficulty, limit = '10', offset = '0', } = req.query;
        const where = {};
        if (examType)
            where.examType = examType;
        if (year)
            where.year = parseInt(year);
        if (topic)
            where.topic = { contains: topic, mode: 'insensitive' };
        if (difficulty)
            where.difficulty = difficulty;
        const [questions, total] = await Promise.all([
            prisma_1.default.previousYearQuestion.findMany({
                where,
                take: parseInt(limit),
                skip: parseInt(offset),
                orderBy: [
                    { year: 'desc' },
                    { questionNumber: 'asc' },
                ],
            }),
            prisma_1.default.previousYearQuestion.count({ where }),
        ]);
        res.json({
            success: true,
            data: questions,
            pagination: {
                total,
                limit: parseInt(limit),
                offset: parseInt(offset),
                hasMore: total > parseInt(offset) + parseInt(limit),
            },
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch previous year questions',
            error: error.message,
        });
    }
});
// GET /api/v1/previous-year-questions/stats
// Get statistics about previous year questions
router.get('/stats', async (_req, res) => {
    try {
        const [totalCount, examTypes, topicDistribution] = await Promise.all([
            prisma_1.default.previousYearQuestion.count(),
            prisma_1.default.previousYearQuestion.groupBy({
                by: ['examType'],
                _count: true,
            }),
            prisma_1.default.previousYearQuestion.groupBy({
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch statistics',
            error: error.message,
        });
    }
});
exports.default = router;
//# sourceMappingURL=previousYearQuestions.js.map