import { Metadata } from 'next';
import { LegalPageTemplate } from '@/design-system/components/templates';

export const metadata: Metadata = {
  title: 'Terms of Service | GVTEWAY',
  description: 'GVTEWAY Terms of Service',
};

export default function TermsPage() {
  const sections = [
    { key: 'acceptance', title: '1. ACCEPTANCE OF TERMS', content: 'By accessing and using GVTEWAY, you accept and agree to be bound by these Terms of Service.' },
    { key: 'eligibility', title: '2. ELIGIBILITY', content: 'You must be at least 18 years old to use our Platform. By using the Platform, you represent that you meet this requirement.' },
    { key: 'account', title: '3. ACCOUNT REGISTRATION', content: 'You must create an account to access certain features. You are responsible for maintaining the confidentiality of your account credentials.' },
    { key: 'membership', title: '4. MEMBERSHIP TIERS', content: 'GVTEWAY offers various membership tiers with different benefits. Membership fees are non-refundable except as required by law.' },
    { key: 'tickets', title: '5. TICKET PURCHASES', content: 'All ticket sales are final. Tickets are non-transferable unless explicitly stated. We reserve the right to cancel or modify events.' },
    { key: 'conduct', title: '6. USER CONDUCT', content: 'You agree not to: Violate any laws; Infringe on intellectual property rights; Harass other users; Attempt to gain unauthorized access; Distribute malware or spam.' },
    { key: 'intellectual', title: '7. INTELLECTUAL PROPERTY', content: 'All content on the Platform is owned by GVTEWAY or its licensors and is protected by copyright, trademark, and other laws.' },
    { key: 'termination', title: '8. TERMINATION', content: 'We may suspend or terminate your account at any time for violation of these Terms or for any other reason.' },
    { key: 'liability', title: '9. LIMITATION OF LIABILITY', content: 'GVTEWAY is not liable for any indirect, incidental, special, or consequential damages arising from your use of the Platform.' },
    { key: 'contact', title: '10. CONTACT', content: 'For questions about these Terms, contact us at support@gvteway.com' },
  ];

  return (
    <LegalPageTemplate
      title="TERMS OF SERVICE"
      lastUpdated="January 8, 2025"
    >
      {sections.map(section => (
        <div key={section.key}>
          <h2>{section.title}</h2>
          <p>{section.content}</p>
        </div>
      ))}
    </LegalPageTemplate>
  );
}
