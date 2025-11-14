/**
 * Question Service
 * Handles question management for mock tests
 */
import { PrismaClient, Question, QuestionType, Difficulty } from '@prisma/client';

const prisma = new PrismaClient();

export interface CreateQuestionInput {
  mockTestId: string;
  questionNumber: number;
  text: string;
  imageUrl?: string;
  type: QuestionType;
  options?: any; // JSON array for MCQ
  correctAnswer: string;
  explanation: string;
  subject: string;
  topic: string;
  subtopic?: string;
  difficulty: Difficulty;
  marks: number;
  negativeMarks?: number;
  generatedByAI?: boolean;
  basedOnPYQId?: string;
  similarityScore?: number;
  metadata?: any;
}

export interface UpdateQuestionInput {
  questionNumber?: number;
  text?: string;
  imageUrl?: string;
  type?: QuestionType;
  options?: any;
  correctAnswer?: string;
  explanation?: string;
  subject?: string;
  topic?: string;
  subtopic?: string;
  difficulty?: Difficulty;
  marks?: number;
  negativeMarks?: number;
  metadata?: any;
}

export class QuestionService {
  /**
   * Get all questions for a mock test
   */
  async getQuestionsByMockTest(mockTestId: string): Promise<Question[]> {
    return prisma.question.findMany({
      where: { mockTestId },
      orderBy: { questionNumber: 'asc' },
    });
  }

  /**
   * Get question by ID
   */
  async getQuestionById(id: string): Promise<Question | null> {
    return prisma.question.findUnique({
      where: { id },
    });
  }

  /**
   * Create a new question
   */
  async createQuestion(data: CreateQuestionInput): Promise<Question> {
    return prisma.question.create({
      data: {
        mockTestId: data.mockTestId,
        questionNumber: data.questionNumber,
        text: data.text,
        imageUrl: data.imageUrl,
        type: data.type,
        options: data.options,
        correctAnswer: data.correctAnswer,
        explanation: data.explanation,
        subject: data.subject,
        topic: data.topic,
        subtopic: data.subtopic,
        difficulty: data.difficulty,
        marks: data.marks,
        negativeMarks: data.negativeMarks ?? 0,
        generatedByAI: data.generatedByAI ?? false,
        basedOnPYQId: data.basedOnPYQId,
        similarityScore: data.similarityScore,
        metadata: data.metadata,
      },
    });
  }

  /**
   * Bulk create questions for a mock test
   */
  async createQuestionsBulk(questions: CreateQuestionInput[]): Promise<{ count: number }> {
    return prisma.question.createMany({
      data: questions.map((q) => ({
        mockTestId: q.mockTestId,
        questionNumber: q.questionNumber,
        text: q.text,
        imageUrl: q.imageUrl,
        type: q.type,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        subject: q.subject,
        topic: q.topic,
        subtopic: q.subtopic,
        difficulty: q.difficulty,
        marks: q.marks,
        negativeMarks: q.negativeMarks ?? 0,
        generatedByAI: q.generatedByAI ?? false,
        basedOnPYQId: q.basedOnPYQId,
        similarityScore: q.similarityScore,
        metadata: q.metadata,
      })),
    });
  }

  /**
   * Update a question
   */
  async updateQuestion(id: string, data: UpdateQuestionInput): Promise<Question> {
    return prisma.question.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete a question
   */
  async deleteQuestion(id: string): Promise<Question> {
    return prisma.question.delete({
      where: { id },
    });
  }

  /**
   * Get questions by topic
   */
  async getQuestionsByTopic(topic: string, difficulty?: Difficulty): Promise<Question[]> {
    return prisma.question.findMany({
      where: {
        topic,
        ...(difficulty && { difficulty }),
      },
    });
  }

  /**
   * Get question statistics for a mock test
   */
  async getQuestionStats(mockTestId: string): Promise<{
    totalQuestions: number;
    byDifficulty: { [key: string]: number };
    bySubject: { [key: string]: number };
  }> {
    const questions = await this.getQuestionsByMockTest(mockTestId);

    const byDifficulty = questions.reduce((acc, q) => {
      acc[q.difficulty] = (acc[q.difficulty] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    const bySubject = questions.reduce((acc, q) => {
      acc[q.subject] = (acc[q.subject] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    return {
      totalQuestions: questions.length,
      byDifficulty,
      bySubject,
    };
  }
}

export const questionService = new QuestionService();
