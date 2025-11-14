'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ParentalConsentPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [token, setToken] = useState('');
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (tokenParam) {
      setToken(tokenParam);
    } else {
      setError('Invalid consent link');
    }
  }, [searchParams]);

  const handleConsent = async () => {
    if (!token) {
      setError('Invalid consent token');
      return;
    }

    setProcessing(true);
    setError('');

    try {
      const response = await fetch('http://localhost:4000/api/v1/auth/parental-consent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Consent processing failed');
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to process consent');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8 bg-white rounded-2xl shadow-2xl p-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">
            Parental Consent for EduTech Platform
          </h2>
          <p className="mt-2 text-gray-600">
            Your child has registered on EduTech Platform
          </p>
        </div>

        {!success && !error && (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="font-semibold text-blue-900 mb-3">
                📋 About EduTech Platform
              </h3>
              <p className="text-sm text-blue-800">
                EduTech is an AI-powered learning platform designed to help students 
                prepare for JEE and NEET exams. We provide practice questions, 
                personalized learning paths, and progress tracking.
              </p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <h3 className="font-semibold text-yellow-900 mb-3">
                🔒 Data Protection & Privacy
              </h3>
              <ul className="text-sm text-yellow-800 space-y-2 list-disc list-inside">
                <li>We comply with India's DPDP Act 2023</li>
                <li>Your child's data is encrypted and secure</li>
                <li>No data is shared with third parties without consent</li>
                <li>You can request data deletion at any time</li>
              </ul>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 className="font-semibold text-green-900 mb-3">
                ✅ By giving consent, you agree to:
              </h3>
              <ul className="text-sm text-green-800 space-y-2 list-disc list-inside">
                <li>Allow your child to create and use an EduTech account</li>
                <li>Our Terms of Service and Privacy Policy</li>
                <li>Collection and processing of necessary educational data</li>
                <li>Communication via email for account and learning updates</li>
              </ul>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={handleConsent}
                disabled={processing || !token}
                className="flex-1 py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processing ? 'Processing...' : '✓ I Give Consent'}
              </button>
              <Link
                href="/"
                className="flex-1 py-3 px-4 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 text-center"
              >
                ✗ Decline
              </Link>
            </div>

            <p className="text-xs text-gray-500 text-center">
              Questions? Contact us at support@edutech.com
            </p>
          </div>
        )}

        {success && (
          <div className="text-center">
            <div className="text-6xl mb-4">✅</div>
            <h3 className="text-2xl font-bold text-gray-900">
              Consent Recorded Successfully!
            </h3>
            <p className="mt-4 text-gray-600">
              Thank you for providing consent. Your child can now access the EduTech platform.
              They will receive a confirmation email shortly.
            </p>
            <div className="mt-6">
              <Link
                href="/"
                className="inline-block py-2 px-6 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
              >
                Back to Home
              </Link>
            </div>
          </div>
        )}

        {error && (
          <div className="text-center">
            <div className="text-6xl mb-4">❌</div>
            <h3 className="text-2xl font-bold text-gray-900">
              Error Processing Consent
            </h3>
            <div className="mt-4 rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
            <p className="mt-4 text-gray-600">
              Please contact support at support@edutech.com
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
