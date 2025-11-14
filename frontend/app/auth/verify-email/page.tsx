'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [token, setToken] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (tokenParam) {
      setToken(tokenParam);
      verifyEmail(tokenParam);
    }
  }, [searchParams]);

  const verifyEmail = async (verificationToken: string) => {
    setVerifying(true);
    setError('');

    try {
      const response = await fetch('http://localhost:4000/api/v1/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: verificationToken }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Verification failed');
      }

      setVerified(true);
      setTimeout(() => {
        router.push('/dashboard');
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Email verification failed');
    } finally {
      setVerifying(false);
    }
  };

  const resendVerification = async () => {
    // Get email from localStorage
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      setError('User information not found. Please login again.');
      return;
    }

    const user = JSON.parse(userStr);
    
    try {
      const response = await fetch('http://localhost:4000/api/v1/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: user.email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to resend');
      }

      alert('Verification email sent! Please check your inbox.');
    } catch (err: any) {
      setError(err.message || 'Failed to resend verification email');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white rounded-2xl shadow-2xl p-8">
        <div className="text-center">
          {verifying && (
            <>
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto"></div>
              <h2 className="mt-6 text-2xl font-bold text-gray-900">
                Verifying your email...
              </h2>
            </>
          )}

          {verified && (
            <>
              <div className="text-6xl mb-4">✅</div>
              <h2 className="text-2xl font-bold text-gray-900">
                Email Verified Successfully!
              </h2>
              <p className="mt-2 text-gray-600">
                Redirecting to dashboard...
              </p>
            </>
          )}

          {error && (
            <>
              <div className="text-6xl mb-4">❌</div>
              <h2 className="text-2xl font-bold text-gray-900">
                Verification Failed
              </h2>
              <div className="mt-4 rounded-md bg-red-50 p-4">
                <p className="text-sm text-red-800">{error}</p>
              </div>
              <div className="mt-6 space-y-3">
                <button
                  onClick={resendVerification}
                  className="w-full py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                >
                  Resend Verification Email
                </button>
                <Link
                  href="/auth/login"
                  className="block w-full py-2 px-4 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50"
                >
                  Back to Login
                </Link>
              </div>
            </>
          )}

          {!token && !verifying && !verified && !error && (
            <>
              <div className="text-6xl mb-4">📧</div>
              <h2 className="text-2xl font-bold text-gray-900">
                Check Your Email
              </h2>
              <p className="mt-4 text-gray-600">
                We've sent a verification link to your email address. 
                Please click the link to verify your account.
              </p>
              <div className="mt-6">
                <button
                  onClick={resendVerification}
                  className="text-sm font-medium text-purple-600 hover:text-purple-500"
                >
                  Didn't receive the email? Resend
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
