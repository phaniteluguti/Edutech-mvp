'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AppLayout from '@/components/layout/AppLayout';

interface TestAttempt {
  id: string;
  status: string;
  startedAt: string;
  submittedAt?: string;
  score?: number;
  totalMarks?: number;
  mockTest: {
    id: string;
    title: string;
    duration: number;
    totalMarks: number;
  };
}

export default function TestHistoryPage() {
  const router = useRouter();
  const [attempts, setAttempts] = useState<TestAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const response = await fetch('http://localhost:4000/api/v1/tests/my-attempts', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setAttempts(data.data || []);
      } else {
        setError(data.message || 'Failed to load test history');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
      case 'SUBMITTED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'IN_PROGRESS':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'ABANDONED':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900 via-purple-800 to-indigo-900 py-12 px-8 mb-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Test History</h1>
              <p className="text-purple-200">View all your past test attempts and results</p>
            </div>
            <Link
              href="/tests"
              className="px-6 py-3 bg-white text-purple-900 font-semibold rounded-lg hover:bg-purple-50 transition-colors shadow-lg hover:shadow-xl"
            >
              Browse Tests
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 pb-8">

        {/* Error State */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && attempts.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <div className="mb-4">
              <svg
                className="mx-auto h-24 w-24 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Test History</h3>
            <p className="text-gray-600 mb-6">You haven't attempted any tests yet</p>
            <Link
              href="/tests"
              className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Take Your First Test
            </Link>
          </div>
        )}

        {/* Test History List */}
        {attempts.length > 0 && (
          <div className="space-y-4">
            {attempts.map((attempt) => (
              <div
                key={attempt.id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {attempt.mockTest.title}
                    </h3>
                    
                    <div className="flex items-center gap-6 text-sm text-gray-600 mb-4">
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {attempt.mockTest.duration} mins
                      </span>
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {attempt.mockTest.totalMarks} Marks
                      </span>
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Started: {formatDate(attempt.startedAt)}
                      </span>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(attempt.status)}`}>
                        {attempt.status}
                      </span>
                      
                      {attempt.score !== undefined && attempt.totalMarks && (
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-bold text-blue-600">
                            {attempt.score}
                          </span>
                          <span className="text-gray-600">/ {attempt.totalMarks}</span>
                          <span className="text-sm text-gray-500">
                            ({((attempt.score / attempt.totalMarks) * 100).toFixed(1)}%)
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {(attempt.status === 'COMPLETED' || attempt.status === 'SUBMITTED') && (
                      <Link
                        href={`/tests/results/${attempt.id}`}
                        className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        View Results
                      </Link>
                    )}
                    
                    {attempt.status === 'IN_PROGRESS' && (
                      <Link
                        href={`/tests/${attempt.mockTest.id}/take`}
                        className="px-4 py-2 bg-yellow-600 text-white font-medium rounded-lg hover:bg-yellow-700 transition-colors"
                      >
                        Resume
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Summary Stats */}
        {attempts.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h4 className="text-sm font-medium text-gray-600 mb-2">Total Attempts</h4>
              <p className="text-3xl font-bold text-gray-900">{attempts.length}</p>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <h4 className="text-sm font-medium text-gray-600 mb-2">Completed</h4>
              <p className="text-3xl font-bold text-green-600">
                {attempts.filter(a => a.status === 'COMPLETED' || a.status === 'SUBMITTED').length}
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <h4 className="text-sm font-medium text-gray-600 mb-2">Average Score</h4>
              <p className="text-3xl font-bold text-blue-600">
                {attempts.filter(a => a.score !== undefined).length > 0
                  ? (
                      attempts
                        .filter(a => a.score !== undefined && a.totalMarks)
                        .reduce((sum, a) => sum + ((a.score! / a.totalMarks!) * 100), 0) /
                      attempts.filter(a => a.score !== undefined).length
                    ).toFixed(1)
                  : '0'}%
              </p>
            </div>
          </div>
        )}
      </div>
      </div>
    </AppLayout>
  );
}
