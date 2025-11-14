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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <button
            onClick={() => router.back()}
            className="mb-6 flex items-center gap-2 text-blue-100 hover:text-white transition-colors group"
          >
            <svg className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Exams
          </button>
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
              <span className="text-2xl">📝</span>
            </div>
            <div>
              <h1 className="text-5xl font-bold mb-2">{examName}</h1>
              <p className="text-xl text-blue-100 font-medium">Mock Tests</p>
            </div>
          </div>
          <p className="text-lg text-blue-50">Choose a mock test to practice and improve your skills</p>
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
          <>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Available Mock Tests</h2>
              <p className="text-gray-600">Select a test to begin your practice session</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {tests.map((test) => (
                <div
                  key={test.id}
                  className="group bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-transparent hover:border-blue-200 transform hover:-translate-y-1"
                >
                  {/* Card Header */}
                  <div className="bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 p-6 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
                    <div className="relative">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-xl font-bold flex-1 pr-2">{test.title}</h3>
                        {test.difficulty && (
                          <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-lg ${
                            test.difficulty === 'Easy' ? 'bg-green-500' :
                            test.difficulty === 'Medium' ? 'bg-yellow-500' :
                            'bg-red-500'
                          } text-white`}>
                            {test.difficulty}
                          </span>
                        )}
                      </div>
                      {test.description && (
                        <p className="text-blue-50 text-sm leading-relaxed">{test.description}</p>
                      )}
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-6 bg-gradient-to-b from-white to-gray-50">
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center justify-between text-sm bg-white rounded-lg p-3 shadow-sm">
                        <span className="text-gray-600 flex items-center gap-2 font-medium">
                          <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Duration
                        </span>
                        <span className="font-bold text-gray-900">{test.duration} mins</span>
                      </div>

                      <div className="flex items-center justify-between text-sm bg-white rounded-lg p-3 shadow-sm">
                        <span className="text-gray-600 flex items-center gap-2 font-medium">
                          <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                          Questions
                        </span>
                        <span className="font-bold text-gray-900">{test.totalQuestions}</span>
                      </div>

                      <div className="flex items-center justify-between text-sm bg-white rounded-lg p-3 shadow-sm">
                        <span className="text-gray-600 flex items-center gap-2 font-medium">
                          <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Total Marks
                        </span>
                        <span className="font-bold text-gray-900">{test.totalMarks}</span>
                      </div>

                      {test.attemptCount !== undefined && test.attemptCount > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="flex items-center justify-between text-sm bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg p-3">
                            <span className="text-gray-700 flex items-center gap-2 font-medium">
                              <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                              </svg>
                              Best Score
                            </span>
                            <span className="font-bold text-indigo-600 text-lg">
                              {test.highestScore?.toFixed(1)}%
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-2 text-center">
                            Attempted {test.attemptCount} time{test.attemptCount > 1 ? 's' : ''}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={() => startTest(test.id)}
                      disabled={!test.isActive}
                      className={`w-full py-4 rounded-xl font-bold text-white transition-all duration-300 flex items-center justify-center gap-2 text-lg shadow-lg ${
                        test.isActive
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:shadow-2xl transform hover:scale-105'
                          : 'bg-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {test.attemptCount && test.attemptCount > 0 ? (
                        <>
                          <span className="text-2xl">🔄</span>
                          <span>Retake Test</span>
                        </>
                      ) : (
                        <>
                          <span className="text-2xl">🚀</span>
                          <span>Start Test</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-24 bg-white rounded-3xl shadow-xl border-2 border-dashed border-gray-200">
            <div className="max-w-md mx-auto">
              <div className="bg-gradient-to-br from-blue-100 to-indigo-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-12 h-12 text-blue-600"
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
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">No Mock Tests Available Yet</h3>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Mock tests for <span className="font-semibold text-blue-600">{examName}</span> will be available soon. 
                Check back later or explore other exams!
              </p>
              <button
                onClick={() => router.push('/exams')}
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl font-semibold transform hover:scale-105"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Browse Other Exams
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
