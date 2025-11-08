'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin, Plus, X, Loader2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface ScheduleEvent {
  id: string;
  event_id: string;
  events: {
    id: string;
    name: string;
    slug: string;
    start_date: string;
    venue_name: string;
    hero_image_url?: string;
  };
}

export default function SchedulePage() {
  const supabase = createClient();
  const [schedule, setSchedule] = useState<ScheduleEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSchedule();
  }, []);

  async function fetchSchedule() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_schedules')
        .select('*, events:event_id(*)')
        .eq('user_id', user.id);

      if (error) throw error;
      setSchedule(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }

  async function removeFromSchedule(scheduleId: string) {
    const { error } = await supabase
      .from('user_schedules')
      .delete()
      .eq('id', scheduleId);

    if (!error) {
      setSchedule(schedule.filter(item => item.id !== scheduleId));
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-purple-950 to-black">
        <Loader2 className="h-12 w-12 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-950 to-black py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            My Schedule
          </h1>
          <Link href="/events">
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600">
              <Plus className="mr-2 h-4 w-4" />
              Add Events
            </Button>
          </Link>
        </div>

        {schedule.length === 0 ? (
          <Card className="bg-black/40 backdrop-blur-lg border-purple-500/20">
            <CardContent className="py-12 text-center">
              <Calendar className="h-16 w-16 mx-auto text-gray-600 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No events scheduled</h3>
              <p className="text-gray-400 mb-6">
                Start building your schedule by adding events
              </p>
              <Link href="/events">
                <Button className="bg-gradient-to-r from-purple-600 to-pink-600">
                  Browse Events
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {schedule.map((item) => (
              <Card key={item.id} className="bg-black/40 backdrop-blur-lg border-purple-500/20">
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    {item.events.hero_image_url && (
                      <div className="relative w-24 h-24 rounded-lg overflow-hidden">
                        <Image
                          src={item.events.hero_image_url}
                          alt={item.events.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <Link href={`/events/${item.events.slug}`}>
                        <h3 className="text-lg font-semibold text-white hover:text-purple-400">
                          {item.events.name}
                        </h3>
                      </Link>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {new Date(item.events.start_date).toLocaleString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {item.events.venue_name}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFromSchedule(item.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
