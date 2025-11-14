import prisma from '../lib/prisma';
import { TestStatus } from '@prisma/client';

export const testAttemptService = {
  /**
   * Start a new test attempt
   */
  async startAttempt(userId: string, mockTestId: string) {
    // Check if user already has an attempt for this test
    const existing = await prisma.testAttempt.findFirst({
      where: {
        userId,
        mockTestId
      }
    });

    if (existing) {
      if (existing.status === 'SUBMITTED') {
        throw new Error('Test already submitted. Cannot restart.');
      }
      
      // Resume existing attempt
      return existing;
    }

    // Get mock test details to validate
    const mockTest = await prisma.mockTest.findUnique({
      where: { id: mockTestId },
      include: { exam: true }
    });

    if (!mockTest) {
      throw new Error('Mock test not found');
    }

    // Create new attempt
    const attempt = await prisma.testAttempt.create({
      data: {
        userId,
        mockTestId,
        status: 'IN_PROGRESS',
        startedAt: new Date(),
        responses: {},
        syncVersion: 1,
        syncStatus: 'synced'
      },
      include: {
        mockTest: {
          include: {
            exam: true,
            questions: {
              orderBy: { questionNumber: 'asc' },
              select: {
                id: true,
                questionNumber: true,
                text: true,
                imageUrl: true,
                type: true,
                options: true,
                marks: true,
                negativeMarks: true,
                subject: true,
                topic: true,
                difficulty: true
              }
            }
          }
        }
      }
    });

    return attempt;
  },

  /**
   * Get attempt details by ID
   */
  async getAttemptById(attemptId: string, userId: string) {
    const attempt = await prisma.testAttempt.findFirst({
      where: {
        id: attemptId,
        userId
      },
      include: {
        mockTest: {
          include: {
            exam: true,
            questions: {
              orderBy: { questionNumber: 'asc' },
              select: {
                id: true,
                questionNumber: true,
                text: true,
                imageUrl: true,
                type: true,
                options: true,
                marks: true,
                negativeMarks: true,
                subject: true,
                topic: true,
                difficulty: true
              }
            }
          }
        }
      }
    });

    if (!attempt) {
      throw new Error('Test attempt not found');
    }

    return attempt;
  },

  /**
   * Save answer (for auto-save and real-time sync)
   */
  async saveResponse(
    attemptId: string, 
    userId: string, 
    questionId: string, 
    answer: string,
    syncVersion?: number
  ) {
    const attempt = await prisma.testAttempt.findFirst({
      where: {
        id: attemptId,
        userId
      }
    });

    if (!attempt) {
      throw new Error('Test attempt not found');
    }

    if (attempt.status === 'SUBMITTED') {
      throw new Error('Cannot modify submitted test');
    }

    // Optimistic locking check
    if (syncVersion !== undefined && attempt.syncVersion !== syncVersion) {
      throw new Error('SYNC_CONFLICT: Version mismatch');
    }

    // Update responses
    const responses = attempt.responses as Record<string, string>;
    responses[questionId] = answer;

    const updated = await prisma.testAttempt.update({
      where: { id: attemptId },
      data: {
        responses,
        syncVersion: { increment: 1 },
        lastSyncedAt: new Date(),
        syncStatus: 'synced'
      }
    });

    return updated;
  },

  /**
   * Submit test and calculate score
   */
  async submitAttempt(attemptId: string, userId: string) {
    const attempt = await prisma.testAttempt.findFirst({
      where: {
        id: attemptId,
        userId
      },
      include: {
        mockTest: {
          include: {
            questions: true
          }
        }
      }
    });

    if (!attempt) {
      throw new Error('Test attempt not found');
    }

    if (attempt.status === 'SUBMITTED') {
      throw new Error('Test already submitted');
    }

    // Calculate score
    const responses = attempt.responses as Record<string, string>;
    let score = 0;
    let correct = 0;
    let incorrect = 0;
    let unattempted = 0;

    attempt.mockTest.questions.forEach((question) => {
      const userAnswer = responses[question.id];

      if (!userAnswer) {
        unattempted++;
      } else if (userAnswer === question.correctAnswer) {
        correct++;
        score += question.marks;
      } else {
        incorrect++;
        score -= question.negativeMarks;
      }
    });

    // Ensure score doesn't go below 0
    score = Math.max(0, score);

    // Calculate time taken
    const timeTaken = attempt.startedAt 
      ? Math.floor((new Date().getTime() - new Date(attempt.startedAt).getTime()) / 1000)
      : 0;

    // Update attempt
    const submitted = await prisma.testAttempt.update({
      where: { id: attemptId },
      data: {
        status: 'SUBMITTED',
        submittedAt: new Date(),
        score,
        correctAnswers: correct,
        incorrectAnswers: incorrect,
        unattempted,
        timeTaken,
        syncStatus: 'synced'
      },
      include: {
        mockTest: {
          include: {
            exam: true
          }
        }
      }
    });

    return submitted;
  },

  /**
   * Get user's test attempts (for history)
   */
  async getUserAttempts(userId: string, examId?: string) {
    const where: any = { userId };
    
    if (examId) {
      where.mockTest = {
        examId
      };
    }

    const attempts = await prisma.testAttempt.findMany({
      where,
      include: {
        mockTest: {
          include: {
            exam: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return attempts;
  },

  /**
   * Get attempt results with detailed analysis
   */
  async getAttemptResults(attemptId: string, userId: string) {
    const attempt = await prisma.testAttempt.findFirst({
      where: {
        id: attemptId,
        userId
      },
      include: {
        mockTest: {
          include: {
            exam: true,
            questions: true
          }
        }
      }
    });

    if (!attempt) {
      throw new Error('Test attempt not found');
    }

    if (attempt.status !== 'SUBMITTED') {
      throw new Error('Test not yet submitted');
    }

    const responses = attempt.responses as Record<string, string>;
    
    // Build detailed question-wise analysis
    const questionAnalysis = attempt.mockTest.questions.map((question) => {
      const userAnswer = responses[question.id];
      const isCorrect = userAnswer === question.correctAnswer;
      
      return {
        questionId: question.id,
        questionNumber: question.questionNumber,
        subject: question.subject,
        topic: question.topic,
        difficulty: question.difficulty,
        userAnswer,
        correctAnswer: question.correctAnswer,
        isCorrect,
        isAttempted: !!userAnswer,
        marks: question.marks,
        negativeMarks: question.negativeMarks,
        scoreEarned: !userAnswer ? 0 : (isCorrect ? question.marks : -question.negativeMarks),
        explanation: question.explanation
      };
    });

    // Topic-wise analysis
    const topicAnalysis: Record<string, any> = {};
    questionAnalysis.forEach((qa) => {
      if (!topicAnalysis[qa.topic]) {
        topicAnalysis[qa.topic] = {
          topic: qa.topic,
          total: 0,
          attempted: 0,
          correct: 0,
          incorrect: 0,
          score: 0
        };
      }
      
      topicAnalysis[qa.topic].total++;
      if (qa.isAttempted) {
        topicAnalysis[qa.topic].attempted++;
        if (qa.isCorrect) {
          topicAnalysis[qa.topic].correct++;
        } else {
          topicAnalysis[qa.topic].incorrect++;
        }
      }
      topicAnalysis[qa.topic].score += qa.scoreEarned;
    });

    // Generate summary analysis using scoring service
    const { scoringService } = await import('./scoring.service');
    const summary = scoringService.generateSummary(
      attempt.score || 0,
      attempt.mockTest.totalQuestions * 4, // Assuming 4 marks per question
      attempt.correctAnswers || 0,
      attempt.incorrectAnswers || 0,
      attempt.unattempted || 0,
      attempt.mockTest.totalQuestions,
      attempt.timeTaken || 0,
      attempt.mockTest.duration
    );

    // Identify weak topics
    const topicStats = Object.values(topicAnalysis).map(topic => ({
      ...topic,
      accuracy: topic.attempted > 0 ? (topic.correct / topic.attempted) * 100 : 0
    }));
    const weakTopics = topicStats
      .filter(t => t.attempted > 0 && t.accuracy < 60)
      .map(t => t.topic);

    // Generate recommendations
    const recommendations: string[] = [];
    if (summary.accuracy < 50) {
      recommendations.push('Focus on understanding core concepts. Review fundamentals thoroughly.');
    } else if (summary.accuracy < 75) {
      recommendations.push('Good progress! Work on accuracy by practicing more questions.');
    } else {
      recommendations.push('Excellent accuracy! Keep practicing to maintain consistency.');
    }
    
    if (weakTopics.length > 0) {
      recommendations.push(`Focus more on: ${weakTopics.slice(0, 3).join(', ')}`);
    }
    
    if (summary.timeUtilization > 90) {
      recommendations.push('Work on speed. Practice timed tests to improve time management.');
    }

    return {
      score: attempt.score,
      correctAnswers: attempt.correctAnswers,
      incorrectAnswers: attempt.incorrectAnswers,
      unattempted: attempt.unattempted,
      percentile: null, // TODO: Calculate from all attempts
      mockTest: {
        id: attempt.mockTest.id,
        title: attempt.mockTest.title,
        totalMarks: attempt.mockTest.totalQuestions * 4,
        duration: attempt.mockTest.duration
      },
      analysis: {
        percentage: summary.percentage,
        accuracy: summary.accuracy,
        timeUtilization: summary.timeUtilization,
        weakTopics,
        recommendations,
        questionWiseAnalysis: questionAnalysis,
        topicWiseStats: topicStats
      }
    };
  },

  /**
   * Check if user has already attempted a test
   */
  async hasAttempted(userId: string, mockTestId: string) {
    const attempt = await prisma.testAttempt.findFirst({
      where: {
        userId,
        mockTestId
      }
    });

    return !!attempt;
  }
};
