'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { format, parseISO, isSameDay, addMinutes } from 'date-fns';
import { Calendar, Clock, Filter, Download, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import styles from './schedule-grid.module.css';
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
    <div className={`${styles.container} ${className || ''}`}>
      {/* Filters */}
      <Card className={styles.filtersCard}>
        <div className={styles.filters}>
          {/* Day Filter */}
          <div className={styles.filterGroup}>
            <Calendar className={styles.filterIcon} />
            <Select value={selectedDay || 'all'} onValueChange={(v) => setSelectedDay(v === 'all' ? null : v)}>
              <SelectTrigger className={styles.selectTrigger}>
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
          <div className={styles.filterGroup}>
            <Filter className={styles.filterIcon} />
            <Select value={selectedStage} onValueChange={setSelectedStage}>
              <SelectTrigger className={styles.selectTrigger}>
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
            <div className={styles.filterGroup}>
              <Filter className={styles.filterIcon} />
              <Select value={selectedGenre} onValueChange={setSelectedGenre}>
                <SelectTrigger className={styles.selectTrigger}>
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

          <div className={styles.actions}>
            <Button variant="outline" size="sm" onClick={handleExportToCalendar}>
              <Download className={styles.actionIcon} />
              Export
            </Button>
          </div>
        </div>
      </Card>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className={styles.gridWrapper}>
          <div className={styles.gridContainer}>
            {/* Stage Headers */}
            <div className={styles.gridHeader} style={{ gridTemplateColumns: `120px repeat(${stages.length}, 1fr)` }}>
              <div className={styles.timeHeader}>Time</div>
              {stages.map((stage) => (
                <div key={stage.id} className={styles.stageHeader}>
                  {stage.name}
                </div>
              ))}
            </div>

            {/* Time Slots */}
            <div className={styles.timeSlots}>
              {timeSlots.map((slot, index) => (
                <div
                  key={index}
                  className={styles.timeSlot}
                  style={{ gridTemplateColumns: `120px repeat(${stages.length}, 1fr)` }}
                >
                  <div className={styles.timeLabel}>
                    {format(slot.time, 'h:mm a')}
                  </div>
                  {stages.map((stage) => {
                    const item = slot.items.find((i) => i.stage_id === stage.id);
                    return (
                      <div key={stage.id} className={styles.slotCell}>
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
        <div className={styles.listView}>
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
  const cardClass = isInPersonalSchedule
    ? hasConflict
      ? styles.cardConflict
      : styles.cardSelected
    : styles.card;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className={cardClass}
    >
      <div className={styles.cardContent}>
        <div className={styles.cardBody}>
          <h4 className={styles.cardTitle}>{item.artist.name}</h4>
          <div className={styles.cardTime}>
            <Clock className={styles.cardTimeIcon} />
            <span>
              {format(parseISO(item.start_time), 'h:mm a')} - {format(parseISO(item.end_time), 'h:mm a')}
            </span>
          </div>
          {showStage && (
            <Badge variant="secondary" className={styles.stageBadge}>
              {item.stage.name}
            </Badge>
          )}
          {item.artist.genre_tags && item.artist.genre_tags.length > 0 && (
            <div className={styles.genreTags}>
              {item.artist.genre_tags.slice(0, 2).map((genre) => (
                <Badge key={genre} variant="outline" className={styles.genreTag}>
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
          className={styles.favoriteButton}
        >
          <Star className={`${styles.favoriteIcon} ${isInPersonalSchedule ? styles.favoriteIconFilled : ''}`} />
        </Button>
      </div>
      {hasConflict && (
        <div className={styles.conflictWarning}>
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
