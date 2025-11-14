import { LegalPageTemplate } from '@/design-system';

export default function PrivacyPage() {
  return (
    <LegalPageTemplate title="PRIVACY POLICY" lastUpdated="January 8, 2025">
      <h2 key="intro">1. INTRODUCTION</h2>
      <p>GVTEWAY is committed to protecting your privacy.</p>
      
      <h2 key="collection">2. DATA COLLECTION</h2>
      <p>We collect information you provide and usage data.</p>
      
      <h2 key="usage">3. DATA USAGE</h2>
      <p>We use data to provide and improve our services.</p>
      
      <h2 key="sharing">4. DATA SHARING</h2>
      <p>We do not sell your personal information.</p>
      
      <h2 key="rights">5. YOUR RIGHTS</h2>
      <p>You have rights to access, correct, and delete your data.</p>
      
      <h2 key="contact">6. CONTACT</h2>
      <p>Email: privacy@gvteway.com</p>
    </LegalPageTemplate>
  );
}
