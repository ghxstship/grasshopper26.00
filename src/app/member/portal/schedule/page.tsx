'use client';

import { PortalDashboardTemplate } from '@/design-system/components/templates';
import { Calendar } from 'lucide-react';
import { useSchedule } from '@/hooks/useSchedule';
import { ScheduleList } from '@/design-system/components/organisms/schedule/schedule-list';

export default function SchedulePage() {
  const { events, loading } = useSchedule();

  return (
    <PortalDashboardTemplate>
      <div>
        <h1>My Schedule</h1>
        <p>Your upcoming events</p>
        {loading ? (
          <div>Loading...</div>
        ) : events.length > 0 ? (
          <ScheduleList events={events} />
        ) : (
          <div>
            <Calendar />
            <h2>No events scheduled</h2>
            <p>Get tickets to see events here</p>
            <button onClick={() => window.location.href = '/events'}>Browse Events</button>
          </div>
        )}
      </div>
    </PortalDashboardTemplate>
  );
}
