import { LegalPageTemplate } from '@/design-system/components/templates';

export default function CookiesPage() {
  return (
    <LegalPageTemplate title="COOKIE POLICY" lastUpdated="January 8, 2025">
      <h2 key="intro">1. INTRODUCTION</h2>
      <p>This Cookie Policy explains how GVTEWAY uses cookies and similar technologies.</p>
      
      <h2 key="what">2. WHAT ARE COOKIES</h2>
      <p>Cookies are small text files stored on your device when you visit our website.</p>
      
      <h2 key="types">3. TYPES OF COOKIES</h2>
      <p>We use essential, analytics, preference, and marketing cookies.</p>
      
      <h2 key="manage">4. MANAGING COOKIES</h2>
      <p>You can control cookies through your browser settings.</p>
      
      <h2 key="contact">5. CONTACT</h2>
      <p>For questions, contact support@gvteway.com</p>
    </LegalPageTemplate>
  );
}
