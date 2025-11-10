/**
 * Event Team Management
 * Manage event staff, roles, and permissions
 */

'use client';

import { use, useEffect, useState } from 'react';
import { ContextualPageTemplate } from '@/design-system/components/templates';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/design-system/components/atoms/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/design-system/components/atoms/card';
import { Badge } from '@/design-system/components/atoms/badge';
import { Plus, Users, Shield } from 'lucide-react';
import { toast } from 'sonner';
import styles from './team-content.module.css';

interface TeamMember {
  id: string;
  user_id: string;
  role: string;
  permissions: string[];
  user_name: string;
  user_email: string;
  added_at: string;
}

export default function EventTeamPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const supabase = createClient();
  
  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState<any>(null);
  const [team, setTeam] = useState<TeamMember[]>([]);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .single();

      if (eventError) throw eventError;
      setEvent(eventData);

      const { data: teamData, error: teamError } = await supabase
        .from('event_team')
        .select('*, users(name, email)')
        .eq('event_id', id);

      if (teamError) throw teamError;
      setTeam(teamData || []);
    } catch (error: any) {
      toast.error('Failed to load team');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ContextualPageTemplate
      breadcrumbs={[
        { label: 'Events', href: '/admin/events' },
        { label: event?.name || 'Event', href: `/admin/events/${id}` },
        { label: 'Team', href: `/admin/events/${id}/team` }
      ]}
      title="Event Team"
      subtitle={event?.name ? `${event.name} - Manage team members and roles` : 'Manage team members and roles'}
      primaryAction={{
        label: 'Add Team Member',
        href: `/admin/events/${id}/team/add`,
        icon: <Plus />
      }}
      metadata={[
        { icon: <Users />, label: 'Team Members', value: team.length.toString() }
      ]}
      loading={loading}
    >
      <div className={styles.teamGrid}>
        {team.map((member) => (
          <Card key={member.id}>
            <CardHeader>
              <CardTitle>{member.user_name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={styles.memberDetails}>
                <p className={styles.memberEmail}>
                  {member.user_email}
                </p>
                <Badge variant="default">
                  <Shield className={styles.iconSmall} />
                  {member.role}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </ContextualPageTemplate>
  );
}
