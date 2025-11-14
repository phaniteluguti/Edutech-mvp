import Link from 'next/link';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-8">
        <div className="mb-8">
          <Link href="/" className="text-purple-600 hover:text-purple-700 text-sm font-medium">
            ← Back to Home
          </Link>
        </div>

        <h1 className="text-4xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
        <p className="text-sm text-gray-600 mb-8">Last updated: November 15, 2025</p>

        <div className="prose prose-purple max-w-none space-y-6 text-gray-700">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">1. Introduction</h2>
            <p>
              Welcome to EduTech ("we," "our," or "us"). We are committed to protecting your personal information
              and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard
              your information when you use our educational platform.
            </p>
            <p>
              This policy is designed to comply with the Digital Personal Data Protection Act (DPDP Act), 2023,
              and other applicable Indian data protection laws.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">2. Information We Collect</h2>
            
            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">2.1 Personal Information</h3>
            <p>We collect the following personal information:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Account Information:</strong> Name, email address, phone number, date of birth</li>
              <li><strong>Profile Information:</strong> Educational background, exam preferences</li>
              <li><strong>Authentication Data:</strong> Password (encrypted), login history</li>
              <li><strong>Parental Information:</strong> For users under 18 years, parent/guardian email for consent verification</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">2.2 Usage Information</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Test attempts, scores, and performance analytics</li>
              <li>Study patterns and progress tracking</li>
              <li>Device information (type, OS, browser)</li>
              <li>IP address and location data (for data localization compliance)</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">2.3 Payment Information</h3>
            <p>
              Payment details are processed through secure third-party payment gateways (Razorpay). We do not
              store complete credit/debit card information on our servers.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">3. How We Use Your Information</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Service Delivery:</strong> To provide exam preparation, mock tests, and personalized study materials</li>
              <li><strong>Performance Analytics:</strong> To track your progress and provide insights</li>
              <li><strong>Communication:</strong> To send important updates, notifications, and support messages</li>
              <li><strong>Improvement:</strong> To analyze usage patterns and improve our platform</li>
              <li><strong>Compliance:</strong> To meet legal and regulatory requirements</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">4. Data Localization (DPDP Act Compliance)</h2>
            <p>
              In accordance with the Digital Personal Data Protection Act, 2023, all personal data of Indian users
              is stored within India on servers located in Indian data centers. This includes:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Primary database hosted in India (Azure India regions)</li>
              <li>Backup data stored within Indian jurisdiction</li>
              <li>No transfer of personal data outside India without explicit consent and regulatory approval</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">5. Parental Consent for Minors</h2>
            <p>
              As required by the DPDP Act, 2023, users under 18 years of age must have verifiable parental consent
              to use our services:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>During registration, we collect parent/guardian email address</li>
              <li>Parents receive a verification email to provide explicit consent</li>
              <li>Account activation for minors requires confirmed parental approval</li>
              <li>Parents can revoke consent and request data deletion at any time</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">6. Your Rights (DPDP Act)</h2>
            <p>Under the DPDP Act, 2023, you have the following rights:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Right to Access:</strong> Request a copy of your personal data</li>
              <li><strong>Right to Correction:</strong> Update or correct inaccurate information</li>
              <li><strong>Right to Erasure:</strong> Request deletion of your personal data</li>
              <li><strong>Right to Data Portability:</strong> Receive your data in a machine-readable format</li>
              <li><strong>Right to Grievance Redressal:</strong> Lodge complaints regarding data handling</li>
              <li><strong>Right to Nominate:</strong> Nominate another person to exercise rights on your behalf in case of death/incapacity</li>
            </ul>
            <p className="mt-4">
              To exercise these rights, contact us at <a href="mailto:privacy@edutech.com" className="text-purple-600 hover:text-purple-700 underline">privacy@edutech.com</a>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">7. Data Sharing and Disclosure</h2>
            <p>We do not sell your personal information. We may share data only in the following cases:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Service Providers:</strong> Third-party vendors for hosting, analytics, payment processing (all India-based)</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
              <li><strong>With Your Consent:</strong> When you explicitly authorize sharing</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">8. Data Security</h2>
            <p>We implement industry-standard security measures:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>256-bit SSL/TLS encryption for data in transit</li>
              <li>AES-256 encryption for data at rest</li>
              <li>Regular security audits and penetration testing</li>
              <li>Multi-factor authentication for sensitive operations</li>
              <li>Access controls and audit logs</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">9. Cookies and Tracking</h2>
            <p>
              We use essential cookies for authentication and session management. Optional cookies for analytics
              require your explicit consent. You can manage cookie preferences in your browser settings.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">10. Data Retention</h2>
            <p>We retain your personal data:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Active Accounts:</strong> For the duration of account activity</li>
              <li><strong>Closed Accounts:</strong> 90 days after deletion request (for recovery purposes)</li>
              <li><strong>Legal Requirements:</strong> As mandated by Indian law (minimum 3 years for financial records)</li>
              <li><strong>Anonymized Data:</strong> Indefinitely for research and improvement</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">11. Children's Privacy</h2>
            <p>
              We comply with DPDP Act requirements for users under 18 years. We do not knowingly collect data
              from children without verified parental consent. If you believe we have inadvertently collected
              information from a minor without consent, contact us immediately.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">12. Changes to Privacy Policy</h2>
            <p>
              We may update this policy periodically. Significant changes will be communicated via email or
              in-app notification. Continued use after changes indicates acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">13. Contact Us</h2>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 mt-4">
              <p className="font-semibold text-gray-900 mb-3">Data Protection Officer</p>
              <p className="text-gray-700">
                Email: <a href="mailto:dpo@edutech.com" className="text-purple-600 hover:text-purple-700 underline">dpo@edutech.com</a><br />
                Address: EduTech Pvt. Ltd., Bengaluru, Karnataka, India<br />
                Grievance Officer: Available Monday-Friday, 9 AM - 6 PM IST
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">14. Governing Law</h2>
            <p>
              This Privacy Policy is governed by the laws of India. Any disputes shall be subject to the exclusive
              jurisdiction of courts in Bengaluru, Karnataka.
            </p>
          </section>

          <div className="mt-12 p-6 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-gray-700">
              <strong>Note:</strong> This privacy policy is compliant with the Digital Personal Data Protection (DPDP) Act, 2023,
              IT Act 2000, and applicable Indian data protection regulations. For Hindi translation (हिंदी), contact support.
            </p>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <Link href="/terms" className="text-purple-600 hover:text-purple-700 text-sm font-medium">
              View Terms of Service →
            </Link>
            <Link href="/auth/register" className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
