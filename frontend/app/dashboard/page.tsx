'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('home');

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

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/auth/signin');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600 text-xl">Loading...</div>
      </div>
    );
  }

  const menuItems = [
    { id: 'home', icon: '🏠', label: 'Home', badge: null },
    { id: 'materials', icon: '📚', label: 'Study Materials', badge: 'Soon' },
    { id: 'ai-chat', icon: '🤖', label: 'AI Assistant', badge: 'Soon' },
    { id: 'analytics', icon: '📊', label: 'Analytics', badge: 'Soon' },
    { id: 'subscription', icon: '💎', label: 'Subscription', badge: 'Soon' },
    { id: 'profile', icon: '👤', label: 'Profile', badge: null },
    { id: 'settings', icon: '⚙️', label: 'Settings', badge: null },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-gradient-to-b from-purple-700 to-indigo-800 text-white transition-all duration-300 flex flex-col`}>
        {/* Logo */}
        <div className="p-4 border-b border-purple-600">
          <div className="flex items-center justify-between">
            {sidebarOpen && (
              <h1 className="text-2xl font-bold">🎓 EduTech</h1>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-purple-600 rounded-lg"
            >
              {sidebarOpen ? '◀' : '▶'}
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeTab === item.id
                  ? 'bg-white text-purple-700 shadow-lg'
                  : 'hover:bg-purple-600 text-white'
              }`}
            >
              <span className="text-2xl">{item.icon}</span>
              {sidebarOpen && (
                <>
                  <span className="flex-1 text-left font-medium">{item.label}</span>
                  {item.badge && (
                    <span className="text-xs bg-yellow-400 text-purple-900 px-2 py-1 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </button>
          ))}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-purple-600">
          {sidebarOpen ? (
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-lg">
                  {user?.name?.charAt(0) || '👤'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{user?.name}</p>
                  <p className="text-xs text-purple-300 truncate">{user?.email}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg text-sm font-medium transition"
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={handleLogout}
              className="w-full p-2 bg-red-500 hover:bg-red-600 rounded-lg text-2xl"
              title="Logout"
            >
              🚪
            </button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Top Bar */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                {menuItems.find(item => item.id === activeTab)?.label || 'Dashboard'}
              </h2>
              <p className="text-sm text-gray-600">Welcome back, {user?.name}!</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-700">Subscription</p>
                <p className="text-xs text-purple-600 font-semibold">{user?.subscriptionTier || 'FREE'}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-6">
          {activeTab === 'home' && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
          )}

          {activeTab === 'profile' && (
            <div className="max-w-2xl">
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-6">Profile Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-600">Full Name</label>
                    <p className="text-lg font-medium text-gray-800">{user?.name}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Email Address</label>
                    <p className="text-lg font-medium text-gray-800">{user?.email}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Account Type</label>
                    <p className="text-lg font-medium text-gray-800">
                      {user?.isMinor ? 'Minor (Under 18)' : 'Adult (18+)'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Email Verification</label>
                    <p className="text-lg font-medium text-gray-800">
                      {user?.isEmailVerified ? '✅ Verified' : '⚠️ Not Verified'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab !== 'home' && activeTab !== 'profile' && (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <div className="text-6xl mb-4">🚧</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Coming Soon</h3>
                <p className="text-gray-600">
                  This feature will be available in future phases
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
