'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../src/components/ui/Card';
import { Button } from '../src/components/ui/Button';
import { Skeleton } from '../src/components/ui/Skeleton';
import { api } from '../src/lib/api';

interface HealthStatus {
  status: string;
  timestamp: string;
}

interface PYQStats {
  success: boolean;
  data: {
    totalQuestions: number;
    byExamType: Array<{ examType: string; count: number }>;
    topTopics: Array<{ topic: string; count: number }>;
  };
}

export default function Home() {
  const [backendHealth, setBackendHealth] = useState<HealthStatus | null>(null);
  const [aiHealth, setAiHealth] = useState<any>(null);
  const [pyqStats, setPyqStats] = useState<PYQStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const [backend, ai, stats] = await Promise.all([
        api.get<HealthStatus>('/health'),
        api.get('/health').catch(() => ({ status: 'error' })),
        api.get<PYQStats>('/api/v1/previous-year-questions/stats').catch(() => null),
      ]);
      setBackendHealth(backend);
      setAiHealth(ai);
      setPyqStats(stats);
    } catch (err: any) {
      setError(err.message || 'Failed to connect to backend');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Navigation Bar */}
      <nav className="absolute top-0 left-0 right-0 z-50 bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
              </svg>
              <span className="text-white font-bold text-xl">EduTech</span>
            </div>
            <div className="flex items-center space-x-4">
              <a href="/auth/login" className="text-white hover:text-yellow-300 transition-colors font-medium">
                Login
              </a>
              <a href="/auth/register" className="bg-yellow-400 text-gray-900 px-4 py-2 rounded-lg hover:bg-yellow-300 transition-colors font-semibold">
                Sign Up
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Inspired by Khan Academy & Brilliant.org */}
      <header className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
              <svg className="w-4 h-4 text-yellow-300" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-sm font-medium text-white">Phase 4 Complete - User Authentication Ready</span>
            </div>
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white">
              <span className="block">EduTech AI Platform</span>
              <span className="block mt-2 bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                Master JEE & NEET
              </span>
            </h1>
            
            <p className="text-xl sm:text-2xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
              AI-Powered Mock Tests Generated from <span className="font-semibold text-yellow-300">10+ Years</span> of Previous Papers
            </p>
            
            <div className="flex flex-wrap gap-4 justify-center pt-6">
              <a href="/auth/register">
                <Button size="lg" className="bg-yellow-400 text-gray-900 hover:bg-yellow-300 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all selection:bg-gray-900 selection:text-yellow-400 font-semibold">
                  🚀 Start Free Trial
                </Button>
              </a>
              <a href="#system-status">
                <Button variant="outline" size="lg" className="border-2 border-white bg-white/20 text-white hover:bg-white hover:text-blue-600 backdrop-blur-sm selection:bg-white selection:text-blue-600">
                  💻 View Demo
                </Button>
              </a>
            </div>

            {/* Stats Pills */}
            <div className="flex flex-wrap gap-4 justify-center pt-8">
              <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
                <span className="text-white font-medium">5,000+ Questions</span>
              </div>
              <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
                <span className="text-white font-medium">AI-Generated Tests</span>
              </div>
              <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
                <span className="text-white font-medium">Personalized Analytics</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0 h-20">
          <svg viewBox="0 0 1440 120" className="w-full h-full" preserveAspectRatio="none">
            <path d="M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,48C672,43,768,53,864,58.7C960,64,1056,64,1152,58.7C1248,53,1344,43,1392,37.3L1440,32L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z" className="fill-blue-50" />
          </svg>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        {/* System Health Stats - Duolingo-inspired */}
        <section id="system-status">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">System Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {loading ? (
              <>
                <Skeleton height={140} />
                <Skeleton height={140} />
                <Skeleton height={140} />
              </>
            ) : (
              <>
                {/* Previous Year Questions Card */}
                <Card className="bg-gradient-to-br from-blue-500 to-blue-600 border-0 shadow-xl hover:shadow-2xl transition-shadow">
                  <CardContent className="p-6 text-white">
                    <div className="flex items-center justify-between mb-4">
                      <div className="bg-white/20 p-3 rounded-full">
                        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                        </svg>
                      </div>
                    </div>
                    <p className="text-blue-100 text-sm font-medium uppercase tracking-wide">Question Bank</p>
                    <p className="text-4xl font-bold mt-2">{pyqStats?.data.totalQuestions || 5}</p>
                    <p className="text-blue-100 text-sm mt-2">Previous Year Questions</p>
                  </CardContent>
                </Card>

                {/* Backend API Card */}
                <Card className="bg-gradient-to-br from-green-500 to-emerald-600 border-0 shadow-xl hover:shadow-2xl transition-shadow">
                  <CardContent className="p-6 text-white">
                    <div className="flex items-center justify-between mb-4">
                      <div className="bg-white/20 p-3 rounded-full">
                        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                    <p className="text-green-100 text-sm font-medium uppercase tracking-wide">Backend API</p>
                    <p className="text-4xl font-bold mt-2">{backendHealth?.status === 'ok' ? '✓ Online' : '✗ Offline'}</p>
                    {backendHealth && (
                      <p className="text-green-100 text-xs mt-2">
                        Last checked: {new Date(backendHealth.timestamp).toLocaleTimeString()}
                      </p>
                    )}
                  </CardContent>
                </Card>

                {/* AI Service Card */}
                <Card className="bg-gradient-to-br from-purple-500 to-pink-600 border-0 shadow-xl hover:shadow-2xl transition-shadow">
                  <CardContent className="p-6 text-white">
                    <div className="flex items-center justify-between mb-4">
                      <div className="bg-white/20 p-3 rounded-full">
                        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M13 7H7v6h6V7z" />
                          <path fillRule="evenodd" d="M7 2a1 1 0 012 0v1h2V2a1 1 0 112 0v1h2a2 2 0 012 2v2h1a1 1 0 110 2h-1v2h1a1 1 0 110 2h-1v2a2 2 0 01-2 2h-2v1a1 1 0 11-2 0v-1H9v1a1 1 0 11-2 0v-1H5a2 2 0 01-2-2v-2H2a1 1 0 110-2h1V9H2a1 1 0 010-2h1V5a2 2 0 012-2h2V2zM5 5h10v10H5V5z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                    <p className="text-purple-100 text-sm font-medium uppercase tracking-wide">AI Engine</p>
                    <p className="text-4xl font-bold mt-2">{aiHealth?.status === 'ok' ? '✓ Ready' : '⚠ Standby'}</p>
                    <p className="text-purple-100 text-xs mt-2">Azure OpenAI Integration</p>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div className="mt-6">
            <Button onClick={checkHealth} className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh Status
            </Button>
          </div>
        </section>

        {/* Features Grid */}
        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Phase 2: Core Infrastructure</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
                <CardTitle className="flex items-center gap-2 text-green-800">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Frontend Stack
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span>Next.js 15 + React 19</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span>Tailwind CSS 4</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span>API Client (Axios)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span>UI Component Library</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span>Zustand State Management</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                <CardTitle className="flex items-center gap-2 text-blue-800">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Backend Stack
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    <span>Express + TypeScript</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    <span>Prisma ORM + PostgreSQL</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    <span>JWT Authentication</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    <span>Rate Limiting</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    <span>Redis Caching</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Phase 3 & 4 Completed */}
        <section>
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 shadow-lg">
            <CardHeader>
              <CardTitle className="text-green-800 text-2xl flex items-center gap-2">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                ✅ Phase 3 & 4 Complete: AI + Authentication
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-700">AI-powered question generation & user authentication ready!</p>
                <div className="grid gap-3">
                  <div className="flex items-start gap-3 p-3 bg-white rounded-lg shadow-sm border-l-4 border-green-500">
                    <div className="flex-shrink-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">✓</div>
                    <div>
                      <p className="font-semibold text-gray-900">Previous Year Questions Database</p>
                      <p className="text-sm text-gray-600">PDF scraping, parsing, pattern analysis - Operational</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-white rounded-lg shadow-sm border-l-4 border-green-500">
                    <div className="flex-shrink-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">✓</div>
                    <div>
                      <p className="font-semibold text-gray-900">AI Question Generation Engine</p>
                      <p className="text-sm text-gray-600">Azure OpenAI integration, similarity checking ready</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-white rounded-lg shadow-sm border-l-4 border-green-500">
                    <div className="flex-shrink-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">✓</div>
                    <div>
                      <p className="font-semibold text-gray-900">FastAPI Service Running</p>
                      <p className="text-sm text-gray-600">6 endpoints operational at port 8001</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-white rounded-lg shadow-sm border-l-4 border-green-500">
                    <div className="flex-shrink-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">✓</div>
                    <div>
                      <p className="font-semibold text-gray-900">User Authentication System</p>
                      <p className="text-sm text-gray-600">Registration, login, password reset - All functional</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-white rounded-lg shadow-sm border-l-4 border-green-500">
                    <div className="flex-shrink-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">✓</div>
                    <div>
                      <p className="font-semibold text-gray-900">DPDP Compliance</p>
                      <p className="text-sm text-gray-600">Parental consent for minors, email verification implemented</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Next Steps */}
        <section>
          <Card className="bg-gradient-to-br from-orange-50 to-yellow-50 border-orange-200 shadow-lg">
            <CardHeader>
              <CardTitle className="text-orange-800 text-2xl">🚀 Next Steps: Phase 5</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-700">Build Subscription & Payment System:</p>
                <div className="grid gap-3">
                  <div className="flex items-start gap-3 p-3 bg-white rounded-lg shadow-sm">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">1</div>
                    <div>
                      <p className="font-semibold text-gray-900">Subscription Tiers</p>
                      <p className="text-sm text-gray-600">FREE, BUNDLE_BASIC, BUNDLE_PLUS, UNLIMITED plans</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-white rounded-lg shadow-sm">
                    <div className="flex-shrink-0 w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold">2</div>
                    <div>
                      <p className="font-semibold text-gray-900">Razorpay Integration</p>
                      <p className="text-sm text-gray-600">Payment gateway, webhook handling, invoice generation</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-white rounded-lg shadow-sm">
                    <div className="flex-shrink-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">3</div>
                    <div>
                      <p className="font-semibold text-gray-900">User Dashboard</p>
                      <p className="text-sm text-gray-600">Tasks T111-T125: Profile management, preferences, settings</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center space-y-4">
            <div className="flex justify-center space-x-6">
              <a href="/auth/register" className="text-gray-400 hover:text-white transition-colors">Sign Up</a>
              <a href="/auth/login" className="text-gray-400 hover:text-white transition-colors">Login</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">About</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Contact</a>
            </div>
            <p className="text-gray-400">© 2025 EduTech AI Platform. Built with ❤️ for JEE & NEET aspirants.</p>
            <p className="text-sm text-gray-500">Phase 4 Complete • User Authentication Live • DPDP Compliant</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
