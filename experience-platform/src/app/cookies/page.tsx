import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cookie Policy - Grasshopper',
  description: 'How we use cookies and tracking technologies',
};

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">Cookie Policy</h1>
        
        <div className="prose prose-invert max-w-none space-y-6">
          <p className="text-muted-foreground">
            <strong>Last Updated:</strong> November 6, 2025
          </p>

          <section>
            <h2 className="text-2xl font-semibold mb-4">1. What Are Cookies?</h2>
            <p>
              Cookies are small text files that are placed on your device when you visit our website. They help us provide you with a better experience by remembering your preferences and understanding how you use our site.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Types of Cookies We Use</h2>
            
            <h3 className="text-xl font-semibold mt-6 mb-3">Necessary Cookies (Required)</h3>
            <p>
              These cookies are essential for the website to function properly. They enable core functionality such as security, network management, and accessibility.
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Authentication:</strong> Keep you logged in</li>
              <li><strong>Security:</strong> Protect against fraud and abuse</li>
              <li><strong>Session:</strong> Remember your cart and preferences during your visit</li>
            </ul>

            <h3 className="text-xl font-semibold mt-6 mb-3">Analytics Cookies (Optional)</h3>
            <p>
              These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously.
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Google Analytics:</strong> Track page views, sessions, and user behavior</li>
              <li><strong>Performance Monitoring:</strong> Identify and fix technical issues</li>
              <li><strong>A/B Testing:</strong> Test different versions of features</li>
            </ul>

            <h3 className="text-xl font-semibold mt-6 mb-3">Marketing Cookies (Optional)</h3>
            <p>
              These cookies track your online activity to help advertisers deliver more relevant advertising or to limit how many times you see an ad.
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Facebook Pixel:</strong> Track conversions and retarget visitors</li>
              <li><strong>Google Ads:</strong> Measure ad campaign effectiveness</li>
              <li><strong>Email Marketing:</strong> Track email opens and clicks</li>
            </ul>

            <h3 className="text-xl font-semibold mt-6 mb-3">Preference Cookies (Optional)</h3>
            <p>
              These cookies remember your settings and preferences to provide a personalized experience.
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Theme:</strong> Remember your dark/light mode preference</li>
              <li><strong>Language:</strong> Remember your language selection</li>
              <li><strong>Location:</strong> Remember your location for event recommendations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. Third-Party Cookies</h2>
            <p>
              Some cookies are placed by third-party services that appear on our pages. We do not control these cookies. Please check the third-party websites for more information:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><a href="https://policies.google.com/technologies/cookies" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google Cookies Policy</a></li>
              <li><a href="https://www.facebook.com/policies/cookies/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Facebook Cookies Policy</a></li>
              <li><a href="https://stripe.com/cookies-policy/legal" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Stripe Cookies Policy</a></li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Managing Your Cookie Preferences</h2>
            <p>
              You can control and manage cookies in several ways:
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">Cookie Consent Banner</h3>
            <p>
              When you first visit our site, you'll see a cookie consent banner where you can choose which types of cookies to accept. You can change your preferences at any time by clicking the "Cookie Settings" link in the footer.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">Browser Settings</h3>
            <p>
              Most browsers allow you to refuse or accept cookies through their settings. Here's how:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Chrome</a></li>
              <li><a href="https://support.mozilla.org/en-US/kb/enhanced-tracking-protection-firefox-desktop" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Firefox</a></li>
              <li><a href="https://support.apple.com/guide/safari/manage-cookies-sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Safari</a></li>
              <li><a href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Edge</a></li>
            </ul>

            <h3 className="text-xl font-semibold mt-6 mb-3">Opt-Out Tools</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li><a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google Analytics Opt-out</a></li>
              <li><a href="https://www.facebook.com/help/568137493302217" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Facebook Ad Preferences</a></li>
              <li><a href="https://optout.networkadvertising.org/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">NAI Opt-out</a></li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Impact of Disabling Cookies</h2>
            <p>
              If you disable cookies, some features of our website may not function properly:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>You may need to log in each time you visit</li>
              <li>Your preferences won't be saved</li>
              <li>Some interactive features may not work</li>
              <li>Your shopping cart may not persist between visits</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Cookie Retention</h2>
            <p>
              Different cookies have different lifespans:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Session Cookies:</strong> Deleted when you close your browser</li>
              <li><strong>Persistent Cookies:</strong> Remain for a set period (typically 1-24 months)</li>
              <li><strong>Authentication Cookies:</strong> Remain until you log out or expire (typically 30 days)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Updates to This Policy</h2>
            <p>
              We may update this Cookie Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. Please check this page periodically for updates.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Contact Us</h2>
            <p>
              If you have questions about our use of cookies, please contact us at:
            </p>
            <ul className="list-none space-y-2 mt-4">
              <li><strong>Email:</strong> <a href="mailto:privacy@grasshopper.com" className="text-primary hover:underline">privacy@grasshopper.com</a></li>
              <li><strong>Address:</strong> Grasshopper Inc., 123 Event Street, San Francisco, CA 94102</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
