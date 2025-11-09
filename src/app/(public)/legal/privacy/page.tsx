/**
 * Privacy Policy Page
 */

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | GVTEWAY',
  description: 'GVTEWAY Privacy Policy and Data Protection',
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="font-anton text-hero uppercase mb-8 border-b-3 border-black pb-4">
          PRIVACY POLICY
        </h1>

        <div className="font-share text-body space-y-6">
          <p className="text-grey-600">
            <strong>Last Updated:</strong> January 8, 2025
          </p>

          <section>
            <h2 className="font-bebas text-h3 uppercase mb-4">1. INTRODUCTION</h2>
            <p>
              GVTEWAY (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.
            </p>
          </section>

          <section>
            <h2 className="font-bebas text-h3 uppercase mb-4">2. INFORMATION WE COLLECT</h2>
            
            <h3 className="font-bebas text-h5 uppercase mb-3 mt-4">Personal Information</h3>
            <p className="mb-3">We collect information that you provide directly to us, including:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Name, email address, and contact information</li>
              <li>Payment information (processed securely through Stripe)</li>
              <li>Profile information (photo, bio, preferences)</li>
              <li>Membership tier and subscription details</li>
              <li>Ticket purchase history</li>
              <li>Event attendance records</li>
            </ul>

            <h3 className="font-bebas text-h5 uppercase mb-3 mt-4">Automatically Collected Information</h3>
            <p className="mb-3">When you use our Platform, we automatically collect:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Device information (IP address, browser type, operating system)</li>
              <li>Usage data (pages visited, time spent, interactions)</li>
              <li>Location data (with your permission)</li>
              <li>Cookies and similar tracking technologies</li>
            </ul>
          </section>

          <section>
            <h2 className="font-bebas text-h3 uppercase mb-4">3. HOW WE USE YOUR INFORMATION</h2>
            <p className="mb-3">We use your information to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Process ticket purchases and membership subscriptions</li>
              <li>Manage your account and provide customer support</li>
              <li>Send transactional emails (order confirmations, tickets, receipts)</li>
              <li>Send promotional communications (with your consent)</li>
              <li>Improve our Platform and user experience</li>
              <li>Prevent fraud and ensure security</li>
              <li>Comply with legal obligations</li>
              <li>Analyze usage patterns and trends</li>
            </ul>
          </section>

          <section>
            <h2 className="font-bebas text-h3 uppercase mb-4">4. INFORMATION SHARING</h2>
            <p className="mb-3">We may share your information with:</p>
            
            <h3 className="font-bebas text-h5 uppercase mb-3 mt-4">Service Providers</h3>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li><strong>Stripe:</strong> Payment processing</li>
              <li><strong>Supabase:</strong> Database and authentication</li>
              <li><strong>Resend:</strong> Email delivery</li>
              <li><strong>Vercel:</strong> Hosting and CDN</li>
            </ul>

            <h3 className="font-bebas text-h5 uppercase mb-3">Legal Requirements</h3>
            <p>
              We may disclose your information if required by law, court order, or government request, or to protect our rights, property, or safety.
            </p>
          </section>

          <section>
            <h2 className="font-bebas text-h3 uppercase mb-4">5. DATA SECURITY</h2>
            <p>
              We implement appropriate technical and organizational measures to protect your information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="font-bebas text-h3 uppercase mb-4">6. YOUR RIGHTS</h2>
            <p className="mb-3">You have the right to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Access:</strong> Request a copy of your personal data</li>
              <li><strong>Correction:</strong> Update or correct inaccurate information</li>
              <li><strong>Deletion:</strong> Request deletion of your data (subject to legal obligations)</li>
              <li><strong>Portability:</strong> Receive your data in a structured format</li>
              <li><strong>Opt-Out:</strong> Unsubscribe from marketing communications</li>
              <li><strong>Withdraw Consent:</strong> Withdraw consent for data processing</li>
            </ul>
            <p className="mt-3">
              To exercise these rights, contact us at support@gvteway.com
            </p>
          </section>

          <section>
            <h2 className="font-bebas text-h3 uppercase mb-4">7. COOKIES AND TRACKING</h2>
            <p className="mb-3">
              We use cookies and similar technologies to enhance your experience. You can control cookies through your browser settings. Types of cookies we use:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Essential:</strong> Required for Platform functionality</li>
              <li><strong>Analytics:</strong> Help us understand usage patterns</li>
              <li><strong>Preferences:</strong> Remember your settings</li>
              <li><strong>Marketing:</strong> Deliver relevant advertisements (with consent)</li>
            </ul>
          </section>

          <section>
            <h2 className="font-bebas text-h3 uppercase mb-4">8. DATA RETENTION</h2>
            <p>
              We retain your information for as long as necessary to provide our services and comply with legal obligations. Account information is retained until you request deletion. Transaction records are retained for 7 years for tax and legal purposes.
            </p>
          </section>

          <section>
            <h2 className="font-bebas text-h3 uppercase mb-4">9. CHILDREN&apos;S PRIVACY</h2>
            <p>
              Our Platform is not intended for users under 18 years of age. We do not knowingly collect information from children. If you believe we have collected information from a child, please contact us immediately.
            </p>
          </section>

          <section>
            <h2 className="font-bebas text-h3 uppercase mb-4">10. INTERNATIONAL TRANSFERS</h2>
            <p>
              Your information may be transferred to and processed in countries other than your country of residence. We ensure appropriate safeguards are in place to protect your information in accordance with this Privacy Policy.
            </p>
          </section>

          <section>
            <h2 className="font-bebas text-h3 uppercase mb-4">11. CHANGES TO THIS POLICY</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of material changes via email or through the Platform. Continued use after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="font-bebas text-h3 uppercase mb-4">12. CONTACT US</h2>
            <p>
              For questions about this Privacy Policy or to exercise your rights, contact us at:
              <br />
              <strong>Email:</strong> support@gvteway.com
              <br />
              <strong>Data Protection Officer:</strong> privacy@gvteway.com
            </p>
          </section>

          <section className="border-t-3 border-black pt-6 mt-8">
            <h2 className="font-bebas text-h3 uppercase mb-4">GDPR COMPLIANCE</h2>
            <p>
              For users in the European Economic Area (EEA), we comply with the General Data Protection Regulation (GDPR). Our legal basis for processing your data includes:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li><strong>Contract Performance:</strong> Processing necessary to fulfill our services</li>
              <li><strong>Legitimate Interests:</strong> Improving our Platform and preventing fraud</li>
              <li><strong>Legal Obligation:</strong> Compliance with applicable laws</li>
              <li><strong>Consent:</strong> Marketing communications and optional features</li>
            </ul>
          </section>

          <section className="border-t-3 border-black pt-6 mt-8">
            <h2 className="font-bebas text-h3 uppercase mb-4">CCPA COMPLIANCE</h2>
            <p className="mb-3">
              For California residents, under the California Consumer Privacy Act (CCPA), you have additional rights:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Right to know what personal information is collected</li>
              <li>Right to know if personal information is sold or disclosed</li>
              <li>Right to opt-out of the sale of personal information</li>
              <li>Right to deletion of personal information</li>
              <li>Right to non-discrimination for exercising CCPA rights</li>
            </ul>
            <p className="mt-3">
              <strong>Note:</strong> GVTEWAY does not sell your personal information.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
