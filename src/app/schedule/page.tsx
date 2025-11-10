'use client';

import { PortalDashboardTemplate } from '@/design-system/components/templates';
import { Calendar } from 'lucide-react';
import { useSchedule } from '@/hooks/useSchedule';
import { ScheduleList } from '@/design-system/components/organisms/schedule/schedule-list';

export default function SchedulePage() {
  const { events, loading } = useSchedule();

  return (
    <PortalDashboardTemplate
      greeting="My Schedule"
      userInfo={<span>Your upcoming events</span>}
      sections={[
        {
          id: 'schedule',
          title: 'Upcoming Events',
          content: <ScheduleList events={events} />,
          isEmpty: events.length === 0,
          emptyState: {
            icon: <Calendar />,
            title: 'No events scheduled',
            description: 'Get tickets to see events here',
            action: { label: 'Browse Events', onClick: () => window.location.href = '/events' },
          },
        },
      ]}
      layout="single-column"
      loading={loading}
    />
  );
}
