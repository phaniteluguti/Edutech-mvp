'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Exam {
  id: string;
  name: string;
  slug: string;
  description: string;
  duration: number;
  totalMarks: number;
  negativeMarking: boolean;
  syllabus: any;
  pattern: any;
}

export default function ExamsPage() {
  const router = useRouter();
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/v1/exams');
      const data = await response.json();
      
      if (data.success) {
        setExams(data.data);
      } else {
        setError(data.message);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-700 to-indigo-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h1 className="text-4xl font-bold mb-4">Choose Your Exam</h1>
          <p className="text-xl text-purple-100">
            AI-powered mock tests for India's most competitive exams
          </p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        </div>
      )}

      {/* Exams Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exams.map((exam) => (
            <div
              key={exam.id}
              className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow cursor-pointer overflow-hidden"
              onClick={() => router.push(`/exams/${exam.slug}`)}
            >
              {/* Card Header */}
              <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white">
                <h3 className="text-2xl font-bold mb-2">{exam.name}</h3>
                <p className="text-purple-100 text-sm">{exam.description}</p>
              </div>

              {/* Card Body */}
              <div className="p-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Duration
                    </span>
                    <span className="font-semibold text-gray-900">{exam.duration} mins</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Total Marks
                    </span>
                    <span className="font-semibold text-gray-900">{exam.totalMarks}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                      </svg>
                      Negative Marking
                    </span>
                    <span className={`font-semibold ${exam.negativeMarking ? 'text-red-600' : 'text-green-600'}`}>
                      {exam.negativeMarking ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>

                {/* CTA Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/exams/${exam.slug}/tests`);
                  }}
                  className="mt-6 w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition font-semibold flex items-center justify-center gap-2"
                >
                  View Mock Tests
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>

        {exams.length === 0 && !error && (
          <div className="text-center py-16">
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
            <h3 className="mt-4 text-lg font-medium text-gray-900">No exams available yet</h3>
            <p className="mt-2 text-sm text-gray-500">Check back soon for new exam options.</p>
          </div>
        )}
      </div>
    </div>
  );
}
