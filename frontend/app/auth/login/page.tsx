'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { initGoogleAuth, renderGoogleButton, type OAuthUser } from '@/lib/oauth';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    emailOrPhone: '',
    password: '',
    rememberMe: false,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoaded, setGoogleLoaded] = useState(false);

  useEffect(() => {
    // Initialize Google Sign-In
    initGoogleAuth()
      .then(() => {
        setGoogleLoaded(true);
        setTimeout(() => {
          renderGoogleButton('google-signin-button', handleGoogleSignIn);
        }, 100);
      })
      .catch((err) => {
        console.error('Failed to initialize Google Auth:', err);
      });
  }, []);

  const handleGoogleSignIn = async (credential: string) => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:4000/api/v1/auth/oauth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          credential,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Google Sign-In failed');

      localStorage.setItem('token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Google Sign-In failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:4000/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
        credentials: 'include', // Include cookies
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Store token
      localStorage.setItem('token', data.data.token);
      
      // Store user info
      localStorage.setItem('user', JSON.stringify(data.data.user));

      // Store remember me preference
      if (formData.rememberMe) {
        localStorage.setItem('rememberMe', 'true');
      } else {
        localStorage.removeItem('rememberMe');
      }

      // Debug: Log the response
      console.log('Login Response:', data.data);
      console.log('requiresParentalConsent:', data.data.requiresParentalConsent);
      console.log('requiresEmailVerification:', data.data.requiresEmailVerification);
      console.log('Should redirect to dashboard:', !data.data.requiresParentalConsent && !data.data.requiresEmailVerification);

      // Redirect based on requirements
      if (data.data.requiresParentalConsent) {
        console.log('Redirecting to: /auth/pending-consent');
        router.push('/auth/pending-consent');
      } else if (data.data.requiresEmailVerification) {
        console.log('Redirecting to: /auth/verify-email');
        router.push('/auth/verify-email');
      } else {
        console.log('Redirecting to: /dashboard');
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid email/phone or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-purple-800 py-12 px-4 sm:px-6 lg:px-8">
      {/* Decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl"></div>
      </div>
      
      <div className="max-w-md w-full space-y-8 bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 relative z-10">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Sign in to your account
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Welcome back! Continue your learning journey
            </p>
          </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">{error}</h3>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="emailOrPhone" className="block text-sm font-medium text-gray-700">
                Email or Phone
              </label>
              <input
                id="emailOrPhone"
                name="emailOrPhone"
                type="text"
                required
                value={formData.emailOrPhone}
                onChange={(e) => setFormData({ ...formData, emailOrPhone: e.target.value })}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm"
                placeholder="john@example.com or +919876543210"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm"
                placeholder="Enter your password"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="rememberMe"
                name="rememberMe"
                type="checkbox"
                checked={formData.rememberMe}
                onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded cursor-pointer"
              />
              <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700 cursor-pointer">
                Remember me
              </label>
            </div>
            <div className="text-sm">
              <Link href="/auth/forgot-password" className="font-medium text-purple-600 hover:text-purple-500">
                Forgot your password?
              </Link>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          <div>
            <button
              type="button"
              onClick={() => {
                if (!googleLoaded) {
                  setError('Google Sign-In is loading. Please try again in a moment.');
                }
                // If googleLoaded is true, the Google button will handle the click
              }}
              className="w-full"
            >
              <div
                id="google-signin-button"
                className="w-full flex justify-center"
                style={{ minHeight: '44px' }}
              >
                {/* Always show button as fallback until Google renders its own */}
                <div className="w-full flex items-center justify-center gap-3 py-3 px-4 border-2 border-gray-300 rounded-lg bg-white text-gray-700 font-medium hover:bg-gray-50 transition-colors cursor-pointer">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span>Continue with Google</span>
                </div>
              </div>
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link href="/auth/register" className="font-medium text-purple-600 hover:text-purple-500">
                Create one now
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
