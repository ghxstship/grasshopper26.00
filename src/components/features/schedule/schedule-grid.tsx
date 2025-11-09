/**
 * Schedule Grid Component
 * Interactive schedule grid for multi-day festivals
 * Inspired by the old Insomniac app schedule view
 */

'use client';

import { useState, useEffect } from 'react';
import { format, parseISO, isSameDay } from 'date-fns';
import { Button } from '@/design-system/components/atoms/button';
import { Card } from '@/design-system/components/atoms/card';
import { Badge } from '@/design-system/components/atoms/badge';
import { ScrollArea } from '@/design-system/components/atoms/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/design-system/components/atoms/tabs';
import { Heart, Clock, MapPin, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ScheduleItem {
  id: string;
  artist_id: string;
  artist_name: string;
  artist_image?: string;
  stage_id: string;
  stage_name: string;
  stage_type: string;
  start_time: string;
  end_time: string;
  special_notes?: string;
}

interface ScheduleGridProps {
  eventId: string;
  className?: string;
}

export function ScheduleGrid({ eventId, className }: ScheduleGridProps) {
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [mySchedule, setMySchedule] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<string>('');
  const [selectedStage, setSelectedStage] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Group schedule by days
  const days = schedule.reduce((acc, item) => {
    const day = format(parseISO(item.start_time), 'yyyy-MM-dd');
    if (!acc.includes(day)) acc.push(day);
    return acc;
  }, [] as string[]);

  // Get unique stages
  const stages = Array.from(
    new Set(schedule.map((item) => item.stage_name))
  );

  const loadSchedule = async () => {
    try {
      const res = await fetch(`/api/v1/events/${eventId}/schedule`);
      const data = await res.json();
      setSchedule(data.schedule || []);
      if (data.schedule?.length > 0 && !selectedDay) {
        setSelectedDay(format(parseISO(data.schedule[0].start_time), 'yyyy-MM-dd'));
      }
    } catch (error) {
      console.error('Failed to load schedule:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMySchedule = async () => {
    try {
      const res = await fetch(`/api/v1/schedule/my-schedule?eventId=${eventId}`);
      const data = await res.json();
      if (data.schedule?.schedule_items) {
        const itemIds = data.schedule.schedule_items.map((item: any) => item.schedule_item_id);
        setMySchedule(new Set(itemIds));
      }
    } catch (error) {
      console.error('Failed to load my schedule:', error);
    }
  };

  useEffect(() => {
    loadSchedule();
    loadMySchedule();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  const toggleMySchedule = async (itemId: string) => {
    const newSchedule = new Set(mySchedule);
    
    if (newSchedule.has(itemId)) {
      newSchedule.delete(itemId);
    } else {
      newSchedule.add(itemId);
    }
    
    setMySchedule(newSchedule);

    // Save to backend
    try {
      await fetch('/api/v1/schedule/my-schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId,
          scheduleItems: Array.from(newSchedule),
        }),
      });
    } catch (error) {
      console.error('Failed to save schedule:', error);
    }
  };

  const filteredSchedule = schedule.filter((item) => {
    const matchesDay = !selectedDay || format(parseISO(item.start_time), 'yyyy-MM-dd') === selectedDay;
    const matchesStage = selectedStage === 'all' || item.stage_name === selectedStage;
    return matchesDay && matchesStage;
  });

  // Check for conflicts in user's schedule
  const hasConflict = (item: ScheduleItem) => {
    if (!mySchedule.has(item.id)) return false;
    
    const itemStart = parseISO(item.start_time);
    const itemEnd = parseISO(item.end_time);
    
    return schedule.some((other) => {
      if (other.id === item.id || !mySchedule.has(other.id)) return false;
      
      const otherStart = parseISO(other.start_time);
      const otherEnd = parseISO(other.end_time);
      
      return (
        (itemStart >= otherStart && itemStart < otherEnd) ||
        (itemEnd > otherStart && itemEnd <= otherEnd) ||
        (itemStart <= otherStart && itemEnd >= otherEnd)
      );
    });
  };

  if (loading) {
    return <div className="text-center py-8">Loading schedule...</div>;
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Day Tabs */}
      {days.length > 1 && (
        <Tabs value={selectedDay} onValueChange={setSelectedDay}>
          <TabsList className="w-full justify-start overflow-x-auto">
            {days.map((day) => (
              <TabsTrigger key={day} value={day} className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {format(parseISO(day), 'EEE, MMM d')}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedStage === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedStage('all')}
        >
          All Stages
        </Button>
        {stages.map((stage) => (
          <Button
            key={stage}
            variant={selectedStage === stage ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedStage(stage)}
          >
            {stage}
          </Button>
        ))}
      </div>

      {/* View Mode Toggle */}
      <div className="flex justify-end gap-2">
        <Button
          variant={viewMode === 'grid' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setViewMode('grid')}
        >
          Grid View
        </Button>
        <Button
          variant={viewMode === 'list' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setViewMode('list')}
        >
          List View
        </Button>
      </div>

      {/* Schedule Display */}
      <ScrollArea className="h-[600px]">
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSchedule.map((item) => (
              <ScheduleCard
                key={item.id}
                item={item}
                isInMySchedule={mySchedule.has(item.id)}
                hasConflict={hasConflict(item)}
                onToggle={() => toggleMySchedule(item.id)}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredSchedule.map((item) => (
              <ScheduleListItem
                key={item.id}
                item={item}
                isInMySchedule={mySchedule.has(item.id)}
                hasConflict={hasConflict(item)}
                onToggle={() => toggleMySchedule(item.id)}
              />
            ))}
          </div>
        )}
      </ScrollArea>

      {/* My Schedule Summary */}
      {mySchedule.size > 0 && (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">My Schedule</h3>
              <p className="text-sm text-muted-foreground">
                {mySchedule.size} {mySchedule.size === 1 ? 'set' : 'sets'} selected
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                Export to Calendar
              </Button>
              <Button variant="outline" size="sm">
                Share Schedule
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

function ScheduleCard({
  item,
  isInMySchedule,
  hasConflict,
  onToggle,
}: {
  item: ScheduleItem;
  isInMySchedule: boolean;
  hasConflict: boolean;
  onToggle: () => void;
}) {
  return (
    <Card className={cn(
      'p-4 transition-all hover:shadow-lg',
      isInMySchedule && 'ring-2 ring-primary',
      hasConflict && 'ring-2 ring-destructive'
    )}>
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-bold text-lg">{item.artist_name}</h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
              <MapPin className="h-3 w-3" />
              <span>{item.stage_name}</span>
            </div>
          </div>
          <Button
            variant={isInMySchedule ? 'default' : 'ghost'}
            size="icon"
            onClick={onToggle}
          >
            <Heart className={cn('h-4 w-4', isInMySchedule && 'fill-current')} />
          </Button>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <Clock className="h-3 w-3" />
          <span>
            {format(parseISO(item.start_time), 'h:mm a')} -{' '}
            {format(parseISO(item.end_time), 'h:mm a')}
          </span>
        </div>

        {item.special_notes && (
          <p className="text-sm text-muted-foreground">{item.special_notes}</p>
        )}

        {hasConflict && (
          <Badge variant="destructive" className="text-xs">
            Schedule Conflict
          </Badge>
        )}

        <Badge variant="outline" className="text-xs">
          {item.stage_type}
        </Badge>
      </div>
    </Card>
  );
}

function ScheduleListItem({
  item,
  isInMySchedule,
  hasConflict,
  onToggle,
}: {
  item: ScheduleItem;
  isInMySchedule: boolean;
  hasConflict: boolean;
  onToggle: () => void;
}) {
  return (
    <Card className={cn(
      'p-3 transition-all',
      isInMySchedule && 'ring-2 ring-primary',
      hasConflict && 'ring-2 ring-destructive'
    )}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <div className="text-sm font-medium min-w-[100px]">
            {format(parseISO(item.start_time), 'h:mm a')}
          </div>
          <div className="flex-1">
            <div className="font-semibold">{item.artist_name}</div>
            <div className="text-sm text-muted-foreground">{item.stage_name}</div>
          </div>
          {hasConflict && (
            <Badge variant="destructive" className="text-xs">
              Conflict
            </Badge>
          )}
        </div>
        <Button
          variant={isInMySchedule ? 'default' : 'ghost'}
          size="icon"
          onClick={onToggle}
        >
          <Heart className={cn('h-4 w-4', isInMySchedule && 'fill-current')} />
        </Button>
      </div>
    </Card>
  );
}
