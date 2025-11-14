import { Question, TestAttempt } from '@prisma/client';

export const scoringService = {
  /**
   * Calculate score for a test attempt
   */
  calculateScore(
    questions: Question[],
    responses: Record<string, string>
  ): {
    score: number;
    correctAnswers: number;
    incorrectAnswers: number;
    unattempted: number;
    maxScore: number;
  } {
    let score = 0;
    let correct = 0;
    let incorrect = 0;
    let unattempted = 0;
    let maxScore = 0;

    questions.forEach((question) => {
      maxScore += question.marks;
      const userAnswer = responses[question.id];

      if (!userAnswer || userAnswer.trim() === '') {
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

    return {
      score: parseFloat(score.toFixed(2)),
      correctAnswers: correct,
      incorrectAnswers: incorrect,
      unattempted,
      maxScore
    };
  },

  /**
   * Calculate percentile (mock - would need all attempts in real scenario)
   */
  calculatePercentile(score: number, totalAttempts: number, attemptsBelow: number): number {
    if (totalAttempts === 0) return 0;
    return parseFloat(((attemptsBelow / totalAttempts) * 100).toFixed(2));
  },

  /**
   * Identify weak areas based on attempt
   */
  identifyWeakAreas(
    questions: Question[],
    responses: Record<string, string>
  ): Array<{
    topic: string;
    subject: string;
    attempted: number;
    correct: number;
    accuracy: number;
  }> {
    const topicStats: Record<string, {
      topic: string;
      subject: string;
      total: number;
      attempted: number;
      correct: number;
    }> = {};

    questions.forEach((question) => {
      const key = `${question.subject}-${question.topic}`;
      
      if (!topicStats[key]) {
        topicStats[key] = {
          topic: question.topic,
          subject: question.subject,
          total: 0,
          attempted: 0,
          correct: 0
        };
      }

      topicStats[key].total++;
      
      const userAnswer = responses[question.id];
      if (userAnswer && userAnswer.trim() !== '') {
        topicStats[key].attempted++;
        if (userAnswer === question.correctAnswer) {
          topicStats[key].correct++;
        }
      }
    });

    // Convert to array and calculate accuracy
    const weakAreas = Object.values(topicStats)
      .map((stat) => ({
        topic: stat.topic,
        subject: stat.subject,
        attempted: stat.attempted,
        correct: stat.correct,
        accuracy: stat.attempted > 0 
          ? parseFloat(((stat.correct / stat.attempted) * 100).toFixed(2))
          : 0
      }))
      .filter((area) => area.accuracy < 60) // Consider weak if < 60%
      .sort((a, b) => a.accuracy - b.accuracy);

    return weakAreas;
  },

  /**
   * Generate performance summary
   */
  generateSummary(
    score: number,
    maxScore: number,
    correctAnswers: number,
    incorrectAnswers: number,
    unattempted: number,
    totalQuestions: number,
    timeTaken: number,
    duration: number
  ): {
    percentage: number;
    attemptedPercentage: number;
    accuracy: number;
    timeUtilization: number;
    averageTimePerQuestion: number;
    recommendation: string;
  } {
    const percentage = parseFloat(((score / maxScore) * 100).toFixed(2));
    const attempted = totalQuestions - unattempted;
    const attemptedPercentage = parseFloat(((attempted / totalQuestions) * 100).toFixed(2));
    const accuracy = attempted > 0 
      ? parseFloat(((correctAnswers / attempted) * 100).toFixed(2))
      : 0;
    
    const durationSeconds = duration * 60;
    const timeUtilization = parseFloat(((timeTaken / durationSeconds) * 100).toFixed(2));
    const averageTimePerQuestion = attempted > 0 
      ? parseFloat((timeTaken / attempted).toFixed(2))
      : 0;

    // Generate recommendation
    let recommendation = '';
    if (accuracy < 50) {
      recommendation = 'Focus on understanding concepts better. Review weak topics and practice more.';
    } else if (accuracy < 70) {
      recommendation = 'Good progress! Work on eliminating silly mistakes and time management.';
    } else if (accuracy < 90) {
      recommendation = 'Excellent work! Fine-tune your strategy and aim for perfection.';
    } else {
      recommendation = 'Outstanding performance! Keep up the great work!';
    }

    if (attemptedPercentage < 70) {
      recommendation += ' Try to attempt more questions to maximize your score.';
    }

    if (timeUtilization > 90) {
      recommendation += ' Work on speed to finish within time comfortably.';
    }

    return {
      percentage,
      attemptedPercentage,
      accuracy,
      timeUtilization,
      averageTimePerQuestion,
      recommendation
    };
  },

  /**
   * Compare with previous attempts
   */
  comparePerformance(
    currentScore: number,
    previousAttempts: Array<{ score: number | null; createdAt: Date }>
  ): {
    improvement: number;
    trend: 'improving' | 'declining' | 'stable';
    bestScore: number;
    averageScore: number;
  } {
    const validScores = previousAttempts
      .filter((a) => a.score !== null)
      .map((a) => a.score as number);

    if (validScores.length === 0) {
      return {
        improvement: 0,
        trend: 'stable',
        bestScore: currentScore,
        averageScore: currentScore
      };
    }

    const bestScore = Math.max(...validScores, currentScore);
    const averageScore = parseFloat(
      (validScores.reduce((sum, s) => sum + s, 0) / validScores.length).toFixed(2)
    );
    
    const improvement = parseFloat((currentScore - averageScore).toFixed(2));
    
    // Determine trend (last 3 attempts)
    const recent = validScores.slice(-3);
    let trend: 'improving' | 'declining' | 'stable' = 'stable';
    
    if (recent.length >= 2) {
      const avgRecent = recent.reduce((sum, s) => sum + s, 0) / recent.length;
      if (currentScore > avgRecent + 5) {
        trend = 'improving';
      } else if (currentScore < avgRecent - 5) {
        trend = 'declining';
      }
    }

    return {
      improvement,
      trend,
      bestScore,
      averageScore
    };
  }
};
