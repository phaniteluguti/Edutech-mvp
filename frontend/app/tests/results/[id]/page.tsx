'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface QuestionAnalysis {
  questionNumber: number;
  text: string;
  subject: string;
  topic: string;
  difficulty: string;
  marks: number;
  userAnswer?: string;
  correctAnswer: string;
  isCorrect: boolean;
  timeTaken?: number;
}

interface TopicStats {
  topic: string;
  attempted: number;
  correct: number;
  incorrect: number;
  accuracy: number;
}

interface Results {
  score: number;
  correctAnswers: number;
  incorrectAnswers: number;
  unattempted: number;
  percentile?: number;
  analysis: {
    percentage: number;
    accuracy: number;
    timeUtilization: number;
    weakTopics: string[];
    recommendations: string[];
    questionWiseAnalysis: QuestionAnalysis[];
    topicWiseStats: TopicStats[];
  };
  mockTest: {
    title: string;
    totalMarks: number;
    duration: number;
  };
}

export default function ResultsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [results, setResults] = useState<Results | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'summary' | 'questions' | 'topics'>('summary');

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const response = await fetch(`http://localhost:4000/api/v1/tests/attempts/${params.id}/results`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setResults(data.data);
      } else {
        setError(data.message || 'Failed to fetch results');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !results) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error || 'Failed to load results'}</p>
          <Link href="/tests" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-block">
            Back to Tests
          </Link>
        </div>
      </div>
    );
  }

  const getPerformanceColor = (percentage: number) => {
    if (percentage >= 75) return 'text-green-600';
    if (percentage >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'text-green-600 bg-green-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'hard': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold mb-2">{results.mockTest.title}</h1>
              <p className="text-blue-100">Test Results & Analysis</p>
            </div>
            <Link
              href="/tests"
              className="px-4 py-2 bg-white text-blue-600 font-medium rounded-lg hover:bg-blue-50"
            >
              Back to Tests
            </Link>
          </div>
        </div>
      </div>

      {/* Score Card */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-600">{results.score}</div>
              <div className="text-sm text-gray-500 mt-1">Your Score</div>
            </div>
            <div>
              <div className={`text-4xl font-bold ${getPerformanceColor(results.analysis.percentage)}`}>
                {results.analysis.percentage.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-500 mt-1">Percentage</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-600">{results.correctAnswers}</div>
              <div className="text-sm text-gray-500 mt-1">Correct</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-red-600">{results.incorrectAnswers}</div>
              <div className="text-sm text-gray-500 mt-1">Incorrect</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-gray-600">{results.unattempted}</div>
              <div className="text-sm text-gray-500 mt-1">Unattempted</div>
            </div>
          </div>

          {results.percentile && (
            <div className="mt-6 pt-6 border-t text-center">
              <p className="text-gray-600">
                You scored better than <span className="font-bold text-blue-600">{results.percentile}%</span> of all test takers
              </p>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-lg mb-8">
          <div className="border-b">
            <div className="flex">
              <button
                onClick={() => setActiveTab('summary')}
                className={`flex-1 px-6 py-4 font-medium ${
                  activeTab === 'summary'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Summary & Insights
              </button>
              <button
                onClick={() => setActiveTab('questions')}
                className={`flex-1 px-6 py-4 font-medium ${
                  activeTab === 'questions'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Question-wise Analysis
              </button>
              <button
                onClick={() => setActiveTab('topics')}
                className={`flex-1 px-6 py-4 font-medium ${
                  activeTab === 'topics'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Topic-wise Performance
              </button>
            </div>
          </div>

          <div className="p-6">
            {/* Summary Tab */}
            {activeTab === 'summary' && (
              <div className="space-y-6">
                {/* Performance Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-blue-50 p-6 rounded-lg">
                    <div className="text-sm text-blue-600 font-medium mb-2">Accuracy</div>
                    <div className="text-3xl font-bold text-blue-900">{results.analysis.accuracy.toFixed(1)}%</div>
                    <div className="text-sm text-blue-700 mt-1">
                      {results.correctAnswers} out of {results.correctAnswers + results.incorrectAnswers} attempted
                    </div>
                  </div>

                  <div className="bg-green-50 p-6 rounded-lg">
                    <div className="text-sm text-green-600 font-medium mb-2">Time Utilization</div>
                    <div className="text-3xl font-bold text-green-900">{results.analysis.timeUtilization.toFixed(1)}%</div>
                    <div className="text-sm text-green-700 mt-1">
                      Efficient time management
                    </div>
                  </div>

                  <div className="bg-purple-50 p-6 rounded-lg">
                    <div className="text-sm text-purple-600 font-medium mb-2">Overall Performance</div>
                    <div className={`text-3xl font-bold ${getPerformanceColor(results.analysis.percentage)}`}>
                      {results.analysis.percentage >= 75 ? 'Excellent' : 
                       results.analysis.percentage >= 50 ? 'Good' : 'Needs Improvement'}
                    </div>
                  </div>
                </div>

                {/* Weak Topics */}
                {results.analysis.weakTopics.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-red-900 mb-3">
                      Areas Needing Improvement
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {results.analysis.weakTopics.map((topic, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                {results.analysis.recommendations.length > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-blue-900 mb-3">
                      📝 Recommendations
                    </h3>
                    <ul className="space-y-2">
                      {results.analysis.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-blue-600 mt-1">•</span>
                          <span className="text-blue-800">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Questions Tab */}
            {activeTab === 'questions' && (
              <div className="space-y-4">
                {results.analysis.questionWiseAnalysis.map((q, index) => (
                  <div
                    key={index}
                    className={`border-l-4 p-4 rounded-lg ${
                      q.isCorrect
                        ? 'border-green-500 bg-green-50'
                        : q.userAnswer
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-300 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-bold text-gray-900">Q{q.questionNumber}</span>
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${getDifficultyColor(q.difficulty)}`}>
                            {q.difficulty}
                          </span>
                          <span className="text-sm text-gray-600">{q.topic}</span>
                        </div>
                        <p className="text-gray-700 mb-2 line-clamp-2">{q.text}</p>
                      </div>
                      <div className="ml-4 text-right">
                        <div className="text-2xl mb-1">
                          {q.isCorrect ? '✅' : q.userAnswer ? '❌' : '⚪'}
                        </div>
                        <div className="text-sm text-gray-600">{q.marks} marks</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      {q.userAnswer && (
                        <div>
                          <span className="font-medium text-gray-700">Your Answer: </span>
                          <span className={q.isCorrect ? 'text-green-700 font-semibold' : 'text-red-700 font-semibold'}>
                            {q.userAnswer}
                          </span>
                        </div>
                      )}
                      <div>
                        <span className="font-medium text-gray-700">Correct Answer: </span>
                        <span className="text-green-700 font-semibold">{q.correctAnswer}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Topics Tab */}
            {activeTab === 'topics' && (
              <div className="space-y-4">
                {results.analysis.topicWiseStats.map((topic, index) => (
                  <div key={index} className="border rounded-lg p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{topic.topic}</h3>
                        <p className="text-sm text-gray-500">
                          {topic.attempted} questions attempted
                        </p>
                      </div>
                      <div className={`text-2xl font-bold ${getPerformanceColor(topic.accuracy)}`}>
                        {topic.accuracy.toFixed(1)}%
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-green-600">{topic.correct}</div>
                        <div className="text-sm text-gray-500">Correct</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-red-600">{topic.incorrect}</div>
                        <div className="text-sm text-gray-500">Incorrect</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-gray-600">{topic.attempted}</div>
                        <div className="text-sm text-gray-500">Total Attempted</div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-4">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            topic.accuracy >= 75
                              ? 'bg-green-600'
                              : topic.accuracy >= 50
                              ? 'bg-yellow-600'
                              : 'bg-red-600'
                          }`}
                          style={{ width: `${topic.accuracy}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
