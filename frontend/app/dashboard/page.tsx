'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AppLayout from '@/components/layout/AppLayout';

interface User {
  id: string;
  email: string;
  name: string;
  isMinor: boolean;
  isEmailVerified: boolean;
  subscriptionTier: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = () => {
      try {
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');
        
        if (!token || !userStr) {
          router.push('/auth/signin');
          return;
        }

        const userData = JSON.parse(userStr);
        setUser(userData);
        setLoading(false);
      } catch (error) {
        console.error('Failed to load user:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/auth/signin');
      }
    };

    loadUser();
  }, [router]);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50">
        <div className="p-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                Welcome back, {user?.name}!
              </h1>
              <p className="text-gray-600 text-lg">Here's your learning dashboard</p>
            </div>

            {/* Dashboard Content */}
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Email Status</p>
                      <p className="text-2xl font-bold text-gray-800">
                        {user?.isEmailVerified ? 'Verified' : 'Not Verified'}
                      </p>
                    </div>
                    <div className="text-4xl">
                      {user?.isEmailVerified ? '✅' : '⚠️'}
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Account Type</p>
                      <p className="text-2xl font-bold text-gray-800">
                        {user?.isMinor ? 'Minor' : 'Adult'}
                      </p>
                    </div>
                    <div className="text-4xl">
                      {user?.isMinor ? '👶' : '👤'}
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Subscription</p>
                      <p className="text-2xl font-bold text-gray-800">
                        {user?.subscriptionTier || 'FREE'}
                      </p>
                    </div>
                    <div className="text-4xl">💎</div>
                  </div>
                </div>
              </div>

              {/* Success Banner */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 rounded-xl p-6 shadow-md">
                <div className="flex items-start gap-4">
                  <div className="text-4xl">🎉</div>
                  <div>
                    <h3 className="text-xl font-bold text-green-800 mb-2">
                      Phase 4 Complete - Authentication Working!
                    </h3>
                    <p className="text-green-700 mb-3">
                      You have successfully logged in. Your authentication system is fully functional with:
                    </p>
                    <ul className="space-y-2 text-green-700">
                      <li className="flex items-center gap-2">
                        <span className="text-green-500">✓</span>
                        Email verification via Gmail SMTP
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-green-500">✓</span>
                        Parental consent for minors (DPDP compliance)
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-green-500">✓</span>
                        Secure password hashing
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-green-500">✓</span>
                        JWT token authentication
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Coming Soon Features */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-md p-6 opacity-75 hover:opacity-100 transition">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="text-4xl">💳</div>
                    <h3 className="text-xl font-bold text-gray-800">Phase 5: Subscriptions</h3>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Payment integration with Razorpay is coming next. You'll be able to subscribe to different tiers and manage your subscription.
                  </p>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <p className="text-sm text-yellow-800 font-medium">🚧 Coming Soon</p>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-md p-6 opacity-75 hover:opacity-100 transition">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="text-4xl">🤖</div>
                    <h3 className="text-xl font-bold text-gray-800">AI Study Assistant</h3>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Upload study materials and get AI-powered assistance with your learning. Chat with your documents and get instant answers.
                  </p>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <p className="text-sm text-yellow-800 font-medium">🚧 Coming Soon</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}