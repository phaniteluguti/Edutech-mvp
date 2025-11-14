/**
 * Exam Service
 * Handles exam management (IIT-JEE, NEET, etc.)
 */
import { PrismaClient, Exam } from '@prisma/client';

const prisma = new PrismaClient();

export interface CreateExamInput {
  name: string;
  slug: string;
  description?: string;
  syllabus: any; // JSON object
  pattern: any; // JSON object
  duration: number; // in minutes
  totalMarks: number;
  negativeMarking?: boolean;
}

export interface UpdateExamInput {
  name?: string;
  description?: string;
  syllabus?: any;
  pattern?: any;
  duration?: number;
  totalMarks?: number;
  negativeMarking?: boolean;
  isActive?: boolean;
}

export class ExamService {
  /**
   * Get all exams (optionally filter by active status)
   */
  async getAllExams(activeOnly: boolean = true): Promise<Exam[]> {
    return prisma.exam.findMany({
      where: activeOnly ? { isActive: true } : {},
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Get exam by ID
   */
  async getExamById(id: string): Promise<Exam | null> {
    return prisma.exam.findUnique({
      where: { id },
    });
  }

  /**
   * Get exam by slug
   */
  async getExamBySlug(slug: string): Promise<Exam | null> {
    return prisma.exam.findUnique({
      where: { slug },
    });
  }

  /**
   * Create a new exam (Admin only)
   */
  async createExam(data: CreateExamInput): Promise<Exam> {
    // Check if slug already exists
    const existing = await this.getExamBySlug(data.slug);
    if (existing) {
      throw new Error('Exam with this slug already exists');
    }

    return prisma.exam.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        syllabus: data.syllabus,
        pattern: data.pattern,
        duration: data.duration,
        totalMarks: data.totalMarks,
        negativeMarking: data.negativeMarking ?? true,
      },
    });
  }

  /**
   * Update an exam (Admin only)
   */
  async updateExam(id: string, data: UpdateExamInput): Promise<Exam> {
    return prisma.exam.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete an exam (soft delete by setting isActive = false)
   */
  async deleteExam(id: string): Promise<Exam> {
    return prisma.exam.update({
      where: { id },
      data: { isActive: false },
    });
  }

  /**
   * Get exam statistics
   */
  async getExamStats(examId: string): Promise<{
    totalMockTests: number;
    totalAttempts: number;
  }> {
    const [totalMockTests, totalAttempts] = await Promise.all([
      prisma.mockTest.count({
        where: { examId, isActive: true },
      }),
      prisma.testAttempt.count({
        where: {
          mockTest: {
            examId,
          },
        },
      }),
    ]);

    return {
      totalMockTests,
      totalAttempts,
    };
  }
}

export const examService = new ExamService();
