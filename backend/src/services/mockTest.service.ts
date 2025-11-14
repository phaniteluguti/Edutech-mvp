/**
 * MockTest Service
 * Handles mock test generation and management
 */
import { PrismaClient, MockTest } from '@prisma/client';

const prisma = new PrismaClient();

export interface CreateMockTestInput {
  examId: string;
  title: string;
  description?: string;
  totalQuestions: number;
  duration: number; // in minutes
  difficultyMix: any; // JSON object e.g., {"easy": 30, "medium": 50, "hard": 20}
  generatedByAI?: boolean;
  generationPrompt?: string;
  previousYearsUsed?: number;
}

export interface UpdateMockTestInput {
  title?: string;
  description?: string;
  totalQuestions?: number;
  duration?: number;
  difficultyMix?: any;
  isActive?: boolean;
}

export class MockTestService {
  /**
   * Get all mock tests for an exam
   */
  async getMockTestsByExam(examId: string, activeOnly: boolean = true): Promise<MockTest[]> {
    return prisma.mockTest.findMany({
      where: {
        examId,
        ...(activeOnly && { isActive: true }),
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get mock test by ID with questions
   */
  async getMockTestById(id: string, includeQuestions: boolean = false): Promise<any> {
    return prisma.mockTest.findUnique({
      where: { id },
      include: {
        exam: true,
        questions: includeQuestions ? {
          orderBy: { questionNumber: 'asc' },
        } : false,
      },
    });
  }

  /**
   * Create a new mock test
   */
  async createMockTest(data: CreateMockTestInput): Promise<MockTest> {
    return prisma.mockTest.create({
      data: {
        examId: data.examId,
        title: data.title,
        description: data.description,
        totalQuestions: data.totalQuestions,
        duration: data.duration,
        difficultyMix: data.difficultyMix,
        generatedByAI: data.generatedByAI ?? false,
        generationPrompt: data.generationPrompt,
        previousYearsUsed: data.previousYearsUsed ?? 0,
      },
    });
  }

  /**
   * Update a mock test
   */
  async updateMockTest(id: string, data: UpdateMockTestInput): Promise<MockTest> {
    return prisma.mockTest.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete a mock test (soft delete)
   */
  async deleteMockTest(id: string): Promise<MockTest> {
    return prisma.mockTest.update({
      where: { id },
      data: { isActive: false },
    });
  }

  /**
   * Get mock test statistics
   */
  async getMockTestStats(mockTestId: string): Promise<{
    totalQuestions: number;
    totalAttempts: number;
    averageScore: number | null;
  }> {
    const [questions, attempts] = await Promise.all([
      prisma.question.count({
        where: { mockTestId },
      }),
      prisma.testAttempt.findMany({
        where: {
          mockTestId,
          status: 'SUBMITTED',
        },
        select: { score: true },
      }),
    ]);

    const averageScore = attempts.length > 0
      ? attempts.reduce((sum, a) => sum + (a.score || 0), 0) / attempts.length
      : null;

    return {
      totalQuestions: questions,
      totalAttempts: attempts.length,
      averageScore,
    };
  }

  /**
   * Check if user has already attempted a mock test
   */
  async hasUserAttempted(userId: string, mockTestId: string): Promise<boolean> {
    const attempt = await prisma.testAttempt.findUnique({
      where: {
        userId_mockTestId: {
          userId,
          mockTestId,
        },
      },
    });

    return !!attempt;
  }
}

export const mockTestService = new MockTestService();
