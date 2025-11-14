import Link from 'next/link';

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-8">
        <div className="mb-8">
          <Link href="/" className="text-purple-600 hover:text-purple-700 text-sm font-medium">
            ← Back to Home
          </Link>
        </div>

        <h1 className="text-4xl font-bold text-gray-900 mb-2">Terms of Service</h1>
        <p className="text-sm text-gray-600 mb-8">Last updated: November 15, 2025</p>

        <div className="prose prose-purple max-w-none space-y-6 text-gray-700">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">1. Acceptance of Terms</h2>
            <p>
              By accessing and using EduTech, you accept and agree to be bound by these Terms of Service.
              If you do not agree to these terms, please do not use our platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">2. User Accounts</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>You must provide accurate and complete registration information</li>
              <li>You are responsible for maintaining the confidentiality of your account credentials</li>
              <li>Users under 18 require verified parental consent</li>
              <li>One account per user; multiple accounts are prohibited</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">3. Acceptable Use</h2>
            <p>You agree NOT to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Share test questions or answers publicly</li>
              <li>Use automated tools or bots to access the platform</li>
              <li>Attempt to hack, reverse engineer, or compromise security</li>
              <li>Harass, abuse, or harm other users</li>
              <li>Upload malicious content or viruses</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">4. Intellectual Property</h2>
            <p>
              All content, including questions, study materials, and AI-generated content, is owned by EduTech
              or licensed to us. Unauthorized reproduction or distribution is strictly prohibited.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">5. Subscriptions and Payments</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Subscription fees are non-refundable except as required by law</li>
              <li>Prices are subject to change with 30 days notice</li>
              <li>Free trial users must cancel before trial ends to avoid charges</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">6. Limitation of Liability</h2>
            <p>
              EduTech is provided "as is" without warranties. We are not liable for exam results, admission outcomes,
              or decisions based on platform usage.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">7. Termination</h2>
            <p>
              We reserve the right to suspend or terminate accounts for violations of these terms, fraudulent
              activity, or at our discretion.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">8. Governing Law</h2>
            <p>
              These terms are governed by the laws of India. Disputes are subject to courts in Bengaluru, Karnataka.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">9. Contact</h2>
            <p>
              For questions: <a href="mailto:support@edutech.com" className="text-purple-600 hover:text-purple-700 underline">support@edutech.com</a>
            </p>
          </section>
        </div>

        <div className="mt-12 pt-6 border-t border-gray-200">
          <Link href="/privacy" className="text-purple-600 hover:text-purple-700 text-sm font-medium">
            View Privacy Policy →
          </Link>
        </div>
      </div>
    </div>
  );
}
