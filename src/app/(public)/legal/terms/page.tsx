/**
 * Terms of Service Page
 */

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | GVTEWAY',
  description: 'GVTEWAY Terms of Service and User Agreement',
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="font-anton text-hero uppercase mb-8 border-b-3 border-black pb-4">
          TERMS OF SERVICE
        </h1>

        <div className="font-share text-body space-y-6">
          <p className="text-grey-600">
            <strong>Last Updated:</strong> January 8, 2025
          </p>

          <section>
            <h2 className="font-bebas text-h3 uppercase mb-4">1. ACCEPTANCE OF TERMS</h2>
            <p>
              By accessing and using GVTEWAY (&ldquo;the Platform&rdquo;), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to these Terms of Service, please do not use the Platform.
            </p>
          </section>

          <section>
            <h2 className="font-bebas text-h3 uppercase mb-4">2. USE OF SERVICE</h2>
            <p className="mb-3">
              GVTEWAY provides a platform for event ticketing, membership subscriptions, and merchandise sales. You agree to use the Platform only for lawful purposes and in accordance with these Terms.
            </p>
            <p>
              You must be at least 18 years old to create an account and purchase tickets or memberships. By using the Platform, you represent and warrant that you meet this age requirement.
            </p>
          </section>

          <section>
            <h2 className="font-bebas text-h3 uppercase mb-4">3. MEMBERSHIP SUBSCRIPTIONS</h2>
            <p className="mb-3">
              GVTEWAY offers various membership tiers with different benefits. Membership fees are charged on a recurring basis (monthly or annually) until you cancel your subscription.
            </p>
            <p className="mb-3">
              <strong>Ticket Credits:</strong> Credits are allocated quarterly and expire 12 months from the date of allocation. Credits cannot be transferred, sold, or redeemed for cash.
            </p>
            <p>
              <strong>Cancellation:</strong> You may cancel your membership at any time. Cancellation will take effect at the end of your current billing period. No refunds will be provided for partial billing periods.
            </p>
          </section>

          <section>
            <h2 className="font-bebas text-h3 uppercase mb-4">4. TICKETS AND EVENTS</h2>
            <p className="mb-3">
              All ticket sales are final. Tickets are non-refundable except in the case of event cancellation. Event dates, times, and lineups are subject to change.
            </p>
            <p className="mb-3">
              <strong>Ticket Transfer:</strong> Tickets may be transferred to other users through the Platform. Transfers must be completed within 72 hours and are subject to acceptance by the recipient.
            </p>
            <p>
              <strong>Entry Requirements:</strong> You must present a valid QR code at event entry. Each ticket is valid for one-time entry only. Duplicate or fraudulent tickets will be denied entry.
            </p>
          </section>

          <section>
            <h2 className="font-bebas text-h3 uppercase mb-4">5. PAYMENT AND BILLING</h2>
            <p className="mb-3">
              All payments are processed securely through Stripe. By providing payment information, you authorize GVTEWAY to charge your payment method for all fees incurred.
            </p>
            <p>
              Prices are subject to change. We will notify you of any price changes before they take effect. Continued use of the Platform after price changes constitutes acceptance of the new prices.
            </p>
          </section>

          <section>
            <h2 className="font-bebas text-h3 uppercase mb-4">6. USER CONDUCT</h2>
            <p className="mb-3">You agree not to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Use the Platform for any illegal purpose</li>
              <li>Attempt to gain unauthorized access to any part of the Platform</li>
              <li>Interfere with or disrupt the Platform&apos;s operation</li>
              <li>Upload malicious code or viruses</li>
              <li>Harass, abuse, or harm other users</li>
              <li>Resell tickets at prices higher than face value (scalping)</li>
              <li>Create fake accounts or impersonate others</li>
            </ul>
          </section>

          <section>
            <h2 className="font-bebas text-h3 uppercase mb-4">7. INTELLECTUAL PROPERTY</h2>
            <p>
              All content on the Platform, including text, graphics, logos, images, and software, is the property of GVTEWAY or its licensors and is protected by copyright, trademark, and other intellectual property laws. You may not reproduce, distribute, or create derivative works without express written permission.
            </p>
          </section>

          <section>
            <h2 className="font-bebas text-h3 uppercase mb-4">8. LIMITATION OF LIABILITY</h2>
            <p>
              GVTEWAY is not liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Platform. Our total liability shall not exceed the amount you paid to GVTEWAY in the twelve months preceding the claim.
            </p>
          </section>

          <section>
            <h2 className="font-bebas text-h3 uppercase mb-4">9. TERMINATION</h2>
            <p>
              We reserve the right to terminate or suspend your account at any time for violation of these Terms or for any other reason at our sole discretion. Upon termination, your right to use the Platform will immediately cease.
            </p>
          </section>

          <section>
            <h2 className="font-bebas text-h3 uppercase mb-4">10. CHANGES TO TERMS</h2>
            <p>
              We may modify these Terms at any time. We will notify you of material changes via email or through the Platform. Continued use of the Platform after changes constitutes acceptance of the modified Terms.
            </p>
          </section>

          <section>
            <h2 className="font-bebas text-h3 uppercase mb-4">11. GOVERNING LAW</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which GVTEWAY operates, without regard to its conflict of law provisions.
            </p>
          </section>

          <section>
            <h2 className="font-bebas text-h3 uppercase mb-4">12. CONTACT</h2>
            <p>
              For questions about these Terms, please contact us at:
              <br />
              <strong>Email:</strong> support@gvteway.com
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
