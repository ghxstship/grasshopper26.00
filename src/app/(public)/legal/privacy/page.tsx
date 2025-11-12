import { LegalPageTemplate } from '@/design-system/components/templates';

export const dynamic = 'force-dynamic';

export default function PrivacyPage() {
  const sections = [
    { key: 'introduction', title: '1. INTRODUCTION', content: 'GVTEWAY ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.' },
    { key: 'information', title: '2. INFORMATION WE COLLECT', content: 'We collect information that you provide directly to us, including: Name, email address, and contact information; Payment information (processed securely through Stripe); Profile information (photo, bio, preferences); Membership tier and subscription details; Ticket purchase history; Event attendance records.' },
    { key: 'usage', title: '3. HOW WE USE YOUR INFORMATION', content: 'We use your information to: Process ticket purchases and membership subscriptions; Manage your account and provide customer support; Send transactional emails; Send promotional communications (with your consent); Improve our Platform; Prevent fraud; Comply with legal obligations; Analyze usage patterns.' },
    { key: 'sharing', title: '4. INFORMATION SHARING', content: 'We may share your information with service providers including Stripe (payment processing), Supabase (database), Resend (email), and Vercel (hosting). We may disclose your information if required by law.' },
    { key: 'security', title: '5. DATA SECURITY', content: 'We implement appropriate technical and organizational measures to protect your information against unauthorized access, alteration, disclosure, or destruction.' },
    { key: 'rights', title: '6. YOUR RIGHTS', content: 'You have the right to: Access, Correction, Deletion, Portability, Opt-Out, and Withdraw Consent. Contact us at support@gvteway.com to exercise these rights.' },
    { key: 'cookies', title: '7. COOKIES AND TRACKING', content: 'We use cookies and similar technologies to enhance your experience. Types include: Essential, Analytics, Preferences, and Marketing cookies.' },
    { key: 'retention', title: '8. DATA RETENTION', content: 'We retain your information for as long as necessary to provide our services and comply with legal obligations. Transaction records are retained for 7 years.' },
    { key: 'children', title: '9. CHILDREN\'S PRIVACY', content: 'Our Platform is not intended for users under 18 years of age. We do not knowingly collect information from children.' },
    { key: 'international', title: '10. INTERNATIONAL TRANSFERS', content: 'Your information may be transferred to and processed in countries other than your country of residence with appropriate safeguards.' },
    { key: 'changes', title: '11. CHANGES TO THIS POLICY', content: 'We may update this Privacy Policy from time to time. We will notify you of material changes via email or through the Platform.' },
    { key: 'contact', title: '12. CONTACT US', content: 'Email: support@gvteway.com | Data Protection Officer: privacy@gvteway.com' },
  ];

  return (
    <LegalPageTemplate
      title="PRIVACY POLICY"
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
