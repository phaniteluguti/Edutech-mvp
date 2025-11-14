'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function PendingConsentPage() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white rounded-2xl shadow-2xl p-8">
        <div className="text-center">
          <div className="text-6xl mb-4">⏳</div>
          <h2 className="text-2xl font-bold text-gray-900">
            Parental Consent Required
          </h2>
          
          <div className="mt-6 space-y-4 text-left">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-900 mb-2">
                📧 Email Sent to Parent/Guardian
              </h3>
              <p className="text-sm text-yellow-800">
                We've sent a consent request to{' '}
                <strong>{user?.parentEmail || 'your parent/guardian'}</strong>
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">
                What happens next?
              </h3>
              <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside">
                <li>Your parent/guardian will receive a consent email</li>
                <li>They need to click the link and provide consent</li>
                <li>Once approved, you can access the platform</li>
              </ol>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h3 className="font-semibold text-purple-900 mb-2">
                Why is this required?
              </h3>
              <p className="text-sm text-purple-800">
                As per India's DPDP (Digital Personal Data Protection) Act, 
                we need parental consent for users under 18 years of age.
              </p>
            </div>
          </div>

          <div className="mt-8">
            <Link
              href="/auth/login"
              className="inline-block py-2 px-6 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
            >
              Back to Login
            </Link>
          </div>

          <p className="mt-4 text-xs text-gray-500">
            You'll be able to log in once your parent/guardian provides consent
          </p>
        </div>
      </div>
    </div>
  );
}
