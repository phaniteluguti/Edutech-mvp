'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        setUser(JSON.parse(userStr));
      } catch (error) {
        console.error('Failed to parse user:', error);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/auth/login');
  };

  const isActive = (path: string) => {
    // Exact match for the current path
    if (pathname === path) return true;
    
    // For child routes, check if pathname starts with path
    // but make sure it's not a false positive (e.g., /tests vs /tests/history)
    if (pathname?.startsWith(path + '/')) {
      // Special case: /tests should not match /tests/history
      if (path === '/tests' && pathname?.startsWith('/tests/history')) {
        return false;
      }
      return true;
    }
    
    return false;
  };

  const menuItems = [
    { id: 'home', icon: '🏠', label: 'Home', path: '/dashboard' },
    { id: 'exams', icon: '📝', label: 'Browse Exams', path: '/exams' },
    { id: 'tests', icon: '🎯', label: 'Mock Tests', path: '/tests' },
    { id: 'history', icon: '📜', label: 'Test History', path: '/tests/history' },
    { id: 'materials', icon: '📚', label: 'Study Materials', path: '/materials', badge: 'Soon' },
    { id: 'ai-chat', icon: '🤖', label: 'AI Assistant', path: '/ai-chat', badge: 'Soon' },
    { id: 'analytics', icon: '📊', label: 'Analytics', path: '/analytics', badge: 'Soon' },
    { id: 'subscription', icon: '💎', label: 'Subscription', path: '/subscription', badge: 'Soon' },
  ];

  const accountItems = [
    { id: 'profile', icon: '👤', label: 'Profile', path: '/profile' },
    { id: 'settings', icon: '⚙️', label: 'Settings', path: '/settings' },
    { id: 'privacy', icon: '🔒', label: 'Privacy', path: '/privacy' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-72' : 'w-20'} bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 text-white transition-all duration-300 flex flex-col fixed h-full z-50 shadow-2xl`}>
        {/* Logo */}
        <div className="p-5 border-b border-white/10 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            {sidebarOpen && (
              <Link href="/dashboard" className="flex items-center gap-3 hover:scale-105 transition-transform">
                <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-2xl">🎓</span>
                </div>
                <div>
                  <span className="text-2xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">EduTech</span>
                  <p className="text-xs text-purple-200">Learn. Practice. Excel.</p>
                </div>
              </Link>
            )}
            {!sidebarOpen && (
              <Link href="/dashboard" className="text-2xl hover:scale-110 transition-transform">
                🎓
              </Link>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2.5 hover:bg-white/10 rounded-xl transition-all hover:scale-105 backdrop-blur-sm ml-auto"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {sidebarOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* User Info */}
        {user && sidebarOpen && (
          <div className="p-5 border-b border-white/10 backdrop-blur-sm">
            <div className="bg-gradient-to-r from-purple-600/30 to-indigo-600/30 backdrop-blur-md rounded-2xl p-4 border border-white/10 hover:border-white/20 transition-all">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-full flex items-center justify-center text-xl font-bold shadow-lg ring-4 ring-purple-500/20">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-purple-900 shadow-lg"></div>
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="font-bold text-white truncate text-lg">{user.name}</p>
                  <p className="text-xs text-purple-200 truncate flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                    {user.email}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
        {user && !sidebarOpen && (
          <div className="p-2 border-b border-white/10">
            <div className="relative mx-auto w-12 h-12">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-full flex items-center justify-center text-lg font-bold shadow-lg">
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 border-purple-900"></div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {menuItems.map((item) => (
            <Link
              key={item.id}
              href={item.badge ? '#' : item.path}
              onClick={(e) => {
                if (item.badge) {
                  e.preventDefault();
                }
              }}
              className={`group flex items-center gap-3 p-3.5 rounded-xl transition-all ${
                item.badge
                  ? 'bg-white/5 text-purple-300/50 cursor-not-allowed border border-white/5'
                  : isActive(item.path)
                  ? 'bg-white/20 text-white shadow-lg backdrop-blur-md border border-white/20'
                  : 'hover:bg-white/10 text-purple-100 hover:text-white border border-transparent hover:border-white/10 hover:scale-105 hover:shadow-lg'
              }`}
            >
              <span className={`text-2xl transition-transform ${item.badge ? 'opacity-50 grayscale' : 'group-hover:scale-110'}`}>
                {item.icon}
              </span>
              {sidebarOpen && (
                <>
                  <span className="flex-1 font-medium">{item.label}</span>
                  {item.badge && (
                    <span className="px-2.5 py-1 text-xs bg-gradient-to-r from-gray-400 to-gray-500 text-white rounded-full font-bold shadow-md flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </Link>
          ))}

          <div className="pt-4 mt-4 border-t border-white/10 space-y-1.5">
            <p className={`text-xs font-bold text-purple-300 uppercase tracking-wider ${sidebarOpen ? 'px-3 mb-2' : 'text-center'}`}>
              {sidebarOpen ? 'Account' : '•'}
            </p>
            {accountItems.map((item) => (
              <Link
                key={item.id}
                href={item.path}
                className={`group flex items-center gap-3 p-3.5 rounded-xl transition-all ${
                  isActive(item.path)
                    ? 'bg-white/20 text-white shadow-lg backdrop-blur-md border border-white/20'
                    : 'hover:bg-white/10 text-purple-100 hover:text-white border border-transparent hover:border-white/10'
                } hover:scale-105 hover:shadow-lg`}
              >
                <span className="text-2xl group-hover:scale-110 transition-transform">{item.icon}</span>
                {sidebarOpen && <span className="flex-1 font-medium">{item.label}</span>}
              </Link>
            ))}
          </div>
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-white/10 backdrop-blur-sm">
          <button
            onClick={handleLogout}
            className="w-full group flex items-center gap-3 p-3.5 rounded-xl bg-gradient-to-r from-red-600/80 to-red-700/80 hover:from-red-600 hover:to-red-700 transition-all text-white hover:scale-105 hover:shadow-xl backdrop-blur-md border border-red-500/30"
          >
            <span className="text-2xl group-hover:scale-110 transition-transform">🚪</span>
            {sidebarOpen && <span className="font-semibold">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 ${sidebarOpen ? 'ml-72' : 'ml-20'} transition-all duration-300`}>
        {children}
      </main>
    </div>
  );
}
