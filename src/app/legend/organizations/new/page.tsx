import { OrganizationForm } from '@/design-system/components/organisms/forms/OrganizationForm';
import styles from './page.module.css';

export const metadata = {
  title: 'New Organization | GVTEWAY',
  description: 'Create a new organization',
};

export default function NewOrganizationPage() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>NEW ORGANIZATION</h1>
      </div>

      <OrganizationForm mode="create" />
    </div>
  );
}
