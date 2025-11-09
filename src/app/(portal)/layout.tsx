import { AdvanceCartProvider } from '@/contexts/AdvanceCartContext';

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdvanceCartProvider>
      {children}
    </AdvanceCartProvider>
  );
}
