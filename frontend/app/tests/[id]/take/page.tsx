'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface Question {
  id: string;
  questionNumber: number;
  text: string;
  imageUrl?: string;
  type: 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE' | 'NUMERICAL';
  options?: any;
  marks: number;
  negativeMarks: number;
  subject: string;
  topic: string;
  difficulty: string;
}

interface MockTest {
  id: string;
  title: string;
  duration: number;
  totalMarks: number;
  questions: Question[];
}

interface TestAttempt {
  id: string;
  status: string;
  startedAt: string;
  responses: Record<string, any>;
  syncVersion: number;
  mockTest: MockTest;
}

export default function TakeTestPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [attempt, setAttempt] = useState<TestAttempt | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [markedForReview, setMarkedForReview] = useState<Set<string>>(new Set());
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [serverTime, setServerTime] = useState(0);
  const [syncVersion, setSyncVersion] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    startTest();
  }, []);

  // Auto-save every 30 seconds
  useEffect(() => {
    if (!attempt) return;
    
    const interval = setInterval(() => {
      autoSave();
    }, 30000);

    return () => clearInterval(interval);
  }, [attempt, responses, syncVersion]);

  // Timer countdown
  useEffect(() => {
    if (timeRemaining <= 0) return;

    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        const newTime = prev - 1;
        if (newTime <= 0) {
          submitTest(true); // Auto-submit when time expires
          return 0;
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeRemaining]);

  const startTest = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const response = await fetch(`http://localhost:4000/api/v1/tests/${params.id}/start`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setAttempt(data.data);
        setResponses(data.data.responses || {});
        setSyncVersion(data.data.syncVersion);

        // Calculate time remaining
        const startTime = new Date(data.data.startedAt).getTime();
        const duration = data.data.mockTest.duration * 60; // Convert to seconds
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        setTimeRemaining(Math.max(0, duration - elapsed));
      } else {
        setError(data.message || 'Failed to start test');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const autoSave = async () => {
    if (!attempt || isSaving) return;

    const currentQuestion = attempt.mockTest.questions[currentQuestionIndex];
    const answer = responses[currentQuestion.id];

    if (answer !== undefined) {
      await saveResponse(currentQuestion.id, answer, false);
    }
  };

  const saveResponse = async (questionId: string, answer: string, showFeedback = true) => {
    try {
      setIsSaving(true);
      const token = localStorage.getItem('token');

      const response = await fetch(`http://localhost:4000/api/v1/tests/attempts/${attempt!.id}/responses`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questionId,
          answer,
          syncVersion,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSyncVersion(data.data.syncVersion);
        if (showFeedback) {
          // Optional: Show toast notification
        }
      } else if (response.status === 409) {
        // Sync conflict - reload attempt
        alert('Your test was updated from another device. Reloading...');
        window.location.reload();
      } else {
        setError(data.message || 'Failed to save response');
      }
    } catch (err: any) {
      console.error('Save error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAnswerChange = (questionId: string, answer: string) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: answer,
    }));
    
    // Save immediately
    saveResponse(questionId, answer, false);
  };

  const toggleMarkForReview = () => {
    const currentQuestion = attempt!.mockTest.questions[currentQuestionIndex];
    setMarkedForReview(prev => {
      const newSet = new Set(prev);
      if (newSet.has(currentQuestion.id)) {
        newSet.delete(currentQuestion.id);
      } else {
        newSet.add(currentQuestion.id);
      }
      return newSet;
    });
  };

  const submitTest = async (autoSubmit = false) => {
    if (!autoSubmit) {
      const confirm = window.confirm('Are you sure you want to submit the test? This action cannot be undone.');
      if (!confirm) return;
    }

    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:4000/api/v1/tests/attempts/${attempt!.id}/submit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        router.push(`/tests/results/${attempt!.id}`);
      } else {
        alert(data.message || 'Failed to submit test');
      }
    } catch (err: any) {
      alert(err.message || 'An error occurred while submitting');
    }
  };

  const goToQuestion = (index: number) => {
    setCurrentQuestionIndex(index);
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < attempt!.mockTest.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getQuestionStatus = (question: Question) => {
    const hasAnswer = responses[question.id] !== undefined;
    const isMarked = markedForReview.has(question.id);
    
    if (isMarked) return 'marked';
    if (hasAnswer) return 'answered';
    return 'not-answered';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'answered': return 'bg-green-500 text-white';
      case 'marked': return 'bg-yellow-500 text-white';
      case 'not-answered': return 'bg-gray-200 text-gray-700';
      default: return 'bg-gray-200 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !attempt) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error || 'Failed to load test'}</p>
          <button
            onClick={() => router.push('/tests')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Tests
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = attempt.mockTest.questions[currentQuestionIndex];
  const stats = {
    answered: attempt.mockTest.questions.filter(q => getQuestionStatus(q) === 'answered').length,
    notAnswered: attempt.mockTest.questions.filter(q => getQuestionStatus(q) === 'not-answered').length,
    marked: attempt.mockTest.questions.filter(q => getQuestionStatus(q) === 'marked').length,
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-md">
        <div className="max-w-full px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{attempt.mockTest.title}</h1>
            <p className="text-sm text-gray-500">Question {currentQuestionIndex + 1} of {attempt.mockTest.questions.length}</p>
          </div>
          <div className="flex items-center gap-6">
            <div className={`text-2xl font-bold ${timeRemaining < 300 ? 'text-red-600' : 'text-gray-900'}`}>
              ⏱️ {formatTime(timeRemaining)}
            </div>
            {isSaving && (
              <span className="text-sm text-gray-500">Saving...</span>
            )}
            <button
              onClick={() => submitTest(false)}
              className="px-6 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700"
            >
              Submit Test
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Main Question Area */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-8">
            {/* Question Text */}
            <div className="mb-6">
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Question {currentQuestion.questionNumber}
                </h2>
                <div className="flex gap-2">
                  <span className="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded">
                    {currentQuestion.marks} marks
                  </span>
                  {currentQuestion.negativeMarks > 0 && (
                    <span className="px-3 py-1 bg-red-50 text-red-700 text-sm rounded">
                      -{currentQuestion.negativeMarks} negative
                    </span>
                  )}
                </div>
              </div>
              
              <div className="text-gray-800 leading-relaxed mb-4 whitespace-pre-wrap">
                {currentQuestion.text}
              </div>

              {currentQuestion.imageUrl && (
                <img 
                  src={currentQuestion.imageUrl} 
                  alt="Question" 
                  className="max-w-full h-auto rounded-lg border"
                />
              )}
            </div>

            {/* Options */}
            <div className="space-y-3">
              {currentQuestion.type === 'SINGLE_CHOICE' && currentQuestion.options && (
                <div className="space-y-2">
                  {Object.entries(currentQuestion.options as Record<string, string>).map(([key, value]) => (
                    <label
                      key={key}
                      className="flex items-start p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                      style={{
                        borderColor: responses[currentQuestion.id] === key ? '#3B82F6' : '#E5E7EB',
                        backgroundColor: responses[currentQuestion.id] === key ? '#EFF6FF' : 'white',
                      }}
                    >
                      <input
                        type="radio"
                        name={`question-${currentQuestion.id}`}
                        value={key}
                        checked={responses[currentQuestion.id] === key}
                        onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                        className="mt-1 mr-3"
                      />
                      <span className="flex-1">
                        <span className="font-medium mr-2">{key}.</span>
                        {value}
                      </span>
                    </label>
                  ))}
                </div>
              )}

              {currentQuestion.type === 'NUMERICAL' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Enter your answer:
                  </label>
                  <input
                    type="text"
                    value={responses[currentQuestion.id] || ''}
                    onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                    placeholder="Type numerical answer"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  />
                </div>
              )}
            </div>

            {/* Navigation Buttons */}
            <div className="mt-8 flex justify-between items-center">
              <button
                onClick={previousQuestion}
                disabled={currentQuestionIndex === 0}
                className="px-6 py-2 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ← Previous
              </button>

              <button
                onClick={toggleMarkForReview}
                className={`px-6 py-2 font-medium rounded-lg ${
                  markedForReview.has(currentQuestion.id)
                    ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                    : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                }`}
              >
                {markedForReview.has(currentQuestion.id) ? '★ Marked' : '☆ Mark for Review'}
              </button>

              <button
                onClick={nextQuestion}
                disabled={currentQuestionIndex === attempt.mockTest.questions.length - 1}
                className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next →
              </button>
            </div>
          </div>
        </div>

        {/* Question Palette Sidebar */}
        <div className="w-80 bg-white shadow-lg p-6 overflow-y-auto">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Question Palette</h3>
          
          {/* Stats */}
          <div className="mb-6 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 bg-green-500 rounded"></span>
                Answered
              </span>
              <span className="font-semibold">{stats.answered}</span>
            </div>
            <div className="flex justify-between">
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 bg-gray-200 rounded"></span>
                Not Answered
              </span>
              <span className="font-semibold">{stats.notAnswered}</span>
            </div>
            <div className="flex justify-between">
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 bg-yellow-500 rounded"></span>
                Marked
              </span>
              <span className="font-semibold">{stats.marked}</span>
            </div>
          </div>

          {/* Question Grid */}
          <div className="grid grid-cols-5 gap-2">
            {attempt.mockTest.questions.map((question, index) => {
              const status = getQuestionStatus(question);
              const isCurrent = index === currentQuestionIndex;
              
              return (
                <button
                  key={question.id}
                  onClick={() => goToQuestion(index)}
                  className={`
                    aspect-square flex items-center justify-center font-medium rounded-lg text-sm
                    ${getStatusColor(status)}
                    ${isCurrent ? 'ring-2 ring-blue-600 ring-offset-2' : ''}
                    hover:opacity-80 transition-opacity
                  `}
                >
                  {question.questionNumber}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
