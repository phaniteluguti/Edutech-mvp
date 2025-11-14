'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface MockTest {
  id: string;
  title: string;
  description: string;
  duration: number;
  totalMarks: number;
  totalQuestions: number;
  difficulty: string;
  isActive: boolean;
  latestAttemptId?: string;
  highestScore?: number;
  attemptCount?: number;
  lastAttemptedAt?: string;
}

export default function ExamTestsPage({ params }: { params: Promise<{ slug: string }> }) {
  const router = useRouter();
  const [examSlug, setExamSlug] = useState<string>('');
  const [tests, setTests] = useState<MockTest[]>([]);
  const [examName, setExamName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    params.then(p => {
      setExamSlug(p.slug);
      fetchTests(p.slug);
    });
  }, []);

  const fetchTests = async (slug: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/signin');
        return;
      }

      // First get exam details
      const examResponse = await fetch(`http://localhost:4000/api/v1/exams/${slug}`);
      const examData = await examResponse.json();
      
      if (examData.success) {
        setExamName(examData.data.name);
      }

      // Then get tests for this exam
      const testsResponse = await fetch(`http://localhost:4000/api/v1/tests?examSlug=${slug}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const testsData = await testsResponse.json();
      
      if (testsData.success) {
        setTests(testsData.data);
      } else {
        setError(testsData.message);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load tests');
    } finally {
      setLoading(false);
    }
  };

  const startTest = (testId: string) => {
    router.push(`/tests/${testId}/take`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <button
            onClick={() => router.back()}
            className="mb-4 flex items-center gap-2 text-blue-100 hover:text-white transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Exams
          </button>
          <h1 className="text-4xl font-bold mb-2">{examName} - Mock Tests</h1>
          <p className="text-xl text-blue-100">Choose a mock test to practice</p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
            {error}
          </div>
        </div>
      )}

      {/* Tests Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {tests.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tests.map((test) => (
              <div
                key={test.id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100"
              >
                {/* Card Header */}
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 text-white">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-xl font-bold flex-1">{test.title}</h3>
                    {test.difficulty && (
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        test.difficulty === 'Easy' ? 'bg-green-400' :
                        test.difficulty === 'Medium' ? 'bg-yellow-400' :
                        'bg-red-400'
                      } text-white`}>
                        {test.difficulty}
                      </span>
                    )}
                  </div>
                  {test.description && (
                    <p className="text-blue-100 text-sm">{test.description}</p>
                  )}
                </div>

                {/* Card Body */}
                <div className="p-6">
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 flex items-center gap-2">
                        <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Duration
                      </span>
                      <span className="font-semibold text-gray-900">{test.duration} mins</span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 flex items-center gap-2">
                        <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        Questions
                      </span>
                      <span className="font-semibold text-gray-900">{test.totalQuestions}</span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 flex items-center gap-2">
                        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Total Marks
                      </span>
                      <span className="font-semibold text-gray-900">{test.totalMarks}</span>
                    </div>

                    {test.attemptCount !== undefined && test.attemptCount > 0 && (
                      <>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 flex items-center gap-2">
                            <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            Best Score
                          </span>
                          <span className="font-semibold text-indigo-600">
                            {test.highestScore?.toFixed(1)}%
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">
                          Attempted {test.attemptCount} time{test.attemptCount > 1 ? 's' : ''}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() => startTest(test.id)}
                    disabled={!test.isActive}
                    className={`w-full py-3 rounded-xl font-semibold text-white transition-all duration-300 flex items-center justify-center gap-2 ${
                      test.isActive
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl'
                        : 'bg-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {test.attemptCount && test.attemptCount > 0 ? (
                      <>
                        🔄 Retake Test
                      </>
                    ) : (
                      <>
                        🚀 Start Test
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
            <svg
              className="mx-auto h-16 w-16 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">No mock tests available yet</h3>
            <p className="mt-2 text-sm text-gray-500">
              Mock tests for {examName} will be available soon.
            </p>
            <button
              onClick={() => router.push('/exams')}
              className="mt-6 inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg"
            >
              Browse Other Exams
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
