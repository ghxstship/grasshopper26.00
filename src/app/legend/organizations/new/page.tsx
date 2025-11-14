import { redirect } from 'next/navigation';
import styles from './page.module.css';

export const metadata = {
  title: 'New Organization | GVTEWAY',
  description: 'Create a new organization',
};

export default function NewOrganizationPage() {
  // Redirect to portal organizations new page
  redirect('/portal/organizations/new');
}
