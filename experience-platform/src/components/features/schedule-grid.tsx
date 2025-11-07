'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { format, parseISO, isSameDay, addMinutes } from 'date-fns';
import { Calendar, Clock, Filter, Download, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Artist {
  id: string;
  name: string;
  profile_image_url?: string;
  genre_tags?: string[];
}

interface Stage {
  id: string;
  name: string;
  stage_type?: string;
}

interface ScheduleItem {
  id: string;
  event_id: string;
  stage_id: string;
  artist_id: string;
  start_time: string;
  end_time: string;
  special_notes?: string;
  artist: Artist;
  stage: Stage;
}

interface ScheduleGridProps {
  eventId: string;
  schedule: ScheduleItem[];
  stages: Stage[];
  onAddToPersonalSchedule?: (item: ScheduleItem) => void;
  personalScheduleIds?: string[];
  className?: string;
}

export function ScheduleGrid({
  eventId,
  schedule,
  stages,
  onAddToPersonalSchedule,
  personalScheduleIds = [],
  className,
}: ScheduleGridProps) {
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [selectedStage, setSelectedStage] = useState<string | 'all'>('all');
  const [selectedGenre, setSelectedGenre] = useState<string | 'all'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Get unique days from schedule
  const days = useMemo(() => {
    const uniqueDays = new Set<string>();
    schedule.forEach((item) => {
      const day = format(parseISO(item.start_time), 'yyyy-MM-dd');
      uniqueDays.add(day);
    });
    return Array.from(uniqueDays).sort();
  }, [schedule]);

  // Get unique genres
  const genres = useMemo(() => {
    const uniqueGenres = new Set<string>();
    schedule.forEach((item) => {
      item.artist.genre_tags?.forEach((genre) => uniqueGenres.add(genre));
    });
    return Array.from(uniqueGenres).sort();
  }, [schedule]);

  // Filter schedule
  const filteredSchedule = useMemo(() => {
    return schedule.filter((item) => {
      // Filter by day
      if (selectedDay) {
        const itemDay = format(parseISO(item.start_time), 'yyyy-MM-dd');
        if (itemDay !== selectedDay) return false;
      }

      // Filter by stage
      if (selectedStage !== 'all' && item.stage_id !== selectedStage) {
        return false;
      }

      // Filter by genre
      if (selectedGenre !== 'all') {
        if (!item.artist.genre_tags?.includes(selectedGenre)) {
          return false;
        }
      }

      return true;
    });
  }, [schedule, selectedDay, selectedStage, selectedGenre]);

  // Group schedule by time slots (15-minute intervals)
  const timeSlots = useMemo(() => {
    if (filteredSchedule.length === 0) return [];

    const slots: { time: Date; items: ScheduleItem[] }[] = [];
    const sortedSchedule = [...filteredSchedule].sort(
      (a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
    );

    const startTime = new Date(sortedSchedule[0].start_time);
    const endTime = new Date(sortedSchedule[sortedSchedule.length - 1].end_time);

    let currentTime = new Date(startTime);
    currentTime.setMinutes(Math.floor(currentTime.getMinutes() / 15) * 15);

    while (currentTime <= endTime) {
      const slotItems = filteredSchedule.filter((item) => {
        const itemStart = new Date(item.start_time);
        const itemEnd = new Date(item.end_time);
        return currentTime >= itemStart && currentTime < itemEnd;
      });

      if (slotItems.length > 0) {
        slots.push({ time: new Date(currentTime), items: slotItems });
      }

      currentTime = addMinutes(currentTime, 15);
    }

    return slots;
  }, [filteredSchedule]);

  const handleExportToCalendar = () => {
    // Generate iCal file
    const icsContent = generateICS(filteredSchedule);
    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `event-schedule-${eventId}.ics`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const isInPersonalSchedule = (itemId: string) => {
    return personalScheduleIds.includes(itemId);
  };

  const hasConflict = (item: ScheduleItem) => {
    return filteredSchedule.some((other) => {
      if (other.id === item.id || other.stage_id === item.stage_id) return false;
      if (!isInPersonalSchedule(other.id)) return false;

      const itemStart = new Date(item.start_time);
      const itemEnd = new Date(item.end_time);
      const otherStart = new Date(other.start_time);
      const otherEnd = new Date(other.end_time);

      return (
        (itemStart >= otherStart && itemStart < otherEnd) ||
        (itemEnd > otherStart && itemEnd <= otherEnd) ||
        (itemStart <= otherStart && itemEnd >= otherEnd)
      );
    });
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-4 items-center">
          {/* Day Filter */}
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <Select value={selectedDay || 'all'} onValueChange={(v) => setSelectedDay(v === 'all' ? null : v)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Days" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Days</SelectItem>
                {days.map((day) => (
                  <SelectItem key={day} value={day}>
                    {format(parseISO(day), 'EEEE, MMM d')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Stage Filter */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <Select value={selectedStage} onValueChange={setSelectedStage}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Stages" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stages</SelectItem>
                {stages.map((stage) => (
                  <SelectItem key={stage.id} value={stage.id}>
                    {stage.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Genre Filter */}
          {genres.length > 0 && (
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <Select value={selectedGenre} onValueChange={setSelectedGenre}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Genres" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Genres</SelectItem>
                  {genres.map((genre) => (
                    <SelectItem key={genre} value={genre}>
                      {genre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="ml-auto flex gap-2">
            <Button variant="outline" size="sm" onClick={handleExportToCalendar}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </Card>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            {/* Stage Headers */}
            <div className="grid gap-2 mb-2" style={{ gridTemplateColumns: `120px repeat(${stages.length}, 1fr)` }}>
              <div className="font-semibold text-sm text-gray-500">Time</div>
              {stages.map((stage) => (
                <div key={stage.id} className="font-semibold text-sm text-center p-2 bg-gray-100 rounded">
                  {stage.name}
                </div>
              ))}
            </div>

            {/* Time Slots */}
            <div className="space-y-1">
              {timeSlots.map((slot, index) => (
                <div
                  key={index}
                  className="grid gap-2"
                  style={{ gridTemplateColumns: `120px repeat(${stages.length}, 1fr)` }}
                >
                  <div className="text-sm text-gray-600 py-2">
                    {format(slot.time, 'h:mm a')}
                  </div>
                  {stages.map((stage) => {
                    const item = slot.items.find((i) => i.stage_id === stage.id);
                    return (
                      <div key={stage.id} className="min-h-[60px]">
                        {item && (
                          <ScheduleCard
                            item={item}
                            isInPersonalSchedule={isInPersonalSchedule(item.id)}
                            hasConflict={hasConflict(item)}
                            onAddToSchedule={() => onAddToPersonalSchedule?.(item)}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="space-y-2">
          {filteredSchedule.map((item) => (
            <ScheduleCard
              key={item.id}
              item={item}
              isInPersonalSchedule={isInPersonalSchedule(item.id)}
              hasConflict={hasConflict(item)}
              onAddToSchedule={() => onAddToPersonalSchedule?.(item)}
              showStage
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface ScheduleCardProps {
  item: ScheduleItem;
  isInPersonalSchedule: boolean;
  hasConflict: boolean;
  onAddToSchedule: () => void;
  showStage?: boolean;
}

function ScheduleCard({ item, isInPersonalSchedule, hasConflict, onAddToSchedule, showStage }: ScheduleCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className={`relative p-3 rounded-lg border-2 transition-colors ${
        isInPersonalSchedule
          ? hasConflict
            ? 'bg-red-50 border-red-300'
            : 'bg-purple-50 border-purple-300'
          : 'bg-white border-gray-200 hover:border-gray-300'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm truncate">{item.artist.name}</h4>
          <div className="flex items-center gap-2 mt-1 text-xs text-gray-600">
            <Clock className="h-3 w-3" />
            <span>
              {format(parseISO(item.start_time), 'h:mm a')} - {format(parseISO(item.end_time), 'h:mm a')}
            </span>
          </div>
          {showStage && (
            <Badge variant="secondary" className="mt-1 text-xs">
              {item.stage.name}
            </Badge>
          )}
          {item.artist.genre_tags && item.artist.genre_tags.length > 0 && (
            <div className="flex gap-1 mt-1">
              {item.artist.genre_tags.slice(0, 2).map((genre) => (
                <Badge key={genre} variant="outline" className="text-xs">
                  {genre}
                </Badge>
              ))}
            </div>
          )}
        </div>
        <Button
          size="sm"
          variant={isInPersonalSchedule ? 'default' : 'outline'}
          onClick={onAddToSchedule}
          className="shrink-0"
        >
          <Star className={`h-3 w-3 ${isInPersonalSchedule ? 'fill-current' : ''}`} />
        </Button>
      </div>
      {hasConflict && (
        <div className="mt-2 text-xs text-red-600 font-medium">
          ⚠️ Conflicts with another set in your schedule
        </div>
      )}
    </motion.div>
  );
}

function generateICS(schedule: ScheduleItem[]): string {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Grasshopper//Event Schedule//EN',
    'CALSCALE:GREGORIAN',
  ];

  schedule.forEach((item) => {
    const startTime = parseISO(item.start_time);
    const endTime = parseISO(item.end_time);

    lines.push(
      'BEGIN:VEVENT',
      `UID:${item.id}`,
      `DTSTAMP:${formatICSDate(new Date())}`,
      `DTSTART:${formatICSDate(startTime)}`,
      `DTEND:${formatICSDate(endTime)}`,
      `SUMMARY:${item.artist.name} @ ${item.stage.name}`,
      `DESCRIPTION:${item.special_notes || ''}`,
      `LOCATION:${item.stage.name}`,
      'END:VEVENT'
    );
  });

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

function formatICSDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}
