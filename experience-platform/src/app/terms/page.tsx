import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service - Grasshopper',
  description: 'Terms and conditions for using Grasshopper',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
        
        <div className="prose prose-invert max-w-none space-y-6">
          <p className="text-muted-foreground">
            <strong>Last Updated:</strong> November 6, 2025
          </p>

          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
            <p>
              By accessing and using Grasshopper (&quot;the Service&quot;), you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
            <p>
              Grasshopper provides an online platform for discovering, purchasing tickets to, and managing attendance at live events including concerts, festivals, and other entertainment experiences.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. User Accounts</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>You must be at least 13 years old to create an account</li>
              <li>You are responsible for maintaining the confidentiality of your account</li>
              <li>You are responsible for all activities under your account</li>
              <li>You must provide accurate and complete information</li>
              <li>You must notify us immediately of any unauthorized use</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Ticket Purchases</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>All ticket sales are final unless the event is cancelled</li>
              <li>Tickets are subject to availability</li>
              <li>Prices are subject to change without notice</li>
              <li>Service fees and taxes may apply</li>
              <li>Tickets may not be resold for profit without authorization</li>
              <li>We reserve the right to limit ticket quantities</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Refunds and Cancellations</h2>
            <p>
              Refunds are only provided if:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>The event is cancelled and not rescheduled</li>
              <li>The event is significantly changed (date, venue, lineup)</li>
              <li>Required by applicable law</li>
            </ul>
            <p className="mt-4">
              Refund requests must be submitted within 14 days of the event cancellation.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. User Conduct</h2>
            <p>
              You agree not to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Use the Service for any illegal purpose</li>
              <li>Violate any laws in your jurisdiction</li>
              <li>Infringe on intellectual property rights</li>
              <li>Transmit harmful code or malware</li>
              <li>Harass, abuse, or harm others</li>
              <li>Impersonate any person or entity</li>
              <li>Interfere with the Service&apos;s operation</li>
              <li>Use automated systems to access the Service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Intellectual Property</h2>
            <p>
              All content on the Service, including text, graphics, logos, and software, is the property of Grasshopper or its licensors and is protected by copyright and trademark laws.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, Grasshopper shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. Indemnification</h2>
            <p>
              You agree to indemnify and hold harmless Grasshopper from any claims, damages, or expenses arising from your use of the Service or violation of these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">10. Termination</h2>
            <p>
              We reserve the right to terminate or suspend your account at any time, without notice, for conduct that we believe violates these Terms or is harmful to other users, us, or third parties.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">11. Governing Law</h2>
            <p>
              These Terms shall be governed by the laws of the State of California, without regard to its conflict of law provisions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">12. Changes to Terms</h2>
            <p>
              We reserve the right to modify these Terms at any time. We will notify users of any material changes. Your continued use of the Service after changes constitutes acceptance of the new Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">13. Contact Information</h2>
            <p>
              For questions about these Terms, please contact us at:
            </p>
            <ul className="list-none space-y-2 mt-4">
              <li><strong>Email:</strong> <a href="mailto:legal@grasshopper.com" className="text-primary hover:underline">legal@grasshopper.com</a></li>
              <li><strong>Address:</strong> Grasshopper Inc., 123 Event Street, San Francisco, CA 94102</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
