import { LegalPageTemplate } from '@/design-system/components/templates';

export default function TermsPage() {
  return (
    <LegalPageTemplate title="TERMS OF SERVICE" lastUpdated="January 8, 2025">
      <h2 key="acceptance">1. ACCEPTANCE</h2>
      <p>By using GVTEWAY, you accept these terms.</p>
      
      <h2 key="eligibility">2. ELIGIBILITY</h2>
      <p>You must be 18+ to use our platform.</p>
      
      <h2 key="account">3. ACCOUNT</h2>
      <p>You are responsible for your account security.</p>
      
      <h2 key="conduct">4. CONDUCT</h2>
      <p>Users must follow our community guidelines.</p>
      
      <h2 key="contact">5. CONTACT</h2>
      <p>Email: support@gvteway.com</p>
    </LegalPageTemplate>
  );
}
