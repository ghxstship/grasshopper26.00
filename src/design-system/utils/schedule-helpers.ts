/**
 * Schedule Helper Utilities
 * GHXSTSHIP Entertainment Platform Schedule/Timetable Management
 */

export interface ScheduleItem {
  id: string;
  artistId: string;
  artistName: string;
  stageId: string;
  stageName: string;
  startTime: Date | string;
  endTime: Date | string;
  genre?: string[];
  isHeadliner?: boolean;
}

export interface Stage {
  id: string;
  name: string;
  capacity?: number;
  location?: string;
}

/**
 * Group schedule by stage
 */
export function groupScheduleByStage(items: ScheduleItem[]): Record<string, ScheduleItem[]> {
  return items.reduce((acc, item) => {
    if (!acc[item.stageId]) {
      acc[item.stageId] = [];
    }
    acc[item.stageId].push(item);
    return acc;
  }, {} as Record<string, ScheduleItem[]>);
}

/**
 * Group schedule by day
 */
export function groupScheduleByDay(items: ScheduleItem[]): Record<string, ScheduleItem[]> {
  return items.reduce((acc, item) => {
    const date = typeof item.startTime === 'string' ? new Date(item.startTime) : item.startTime;
    const dayKey = date.toISOString().split('T')[0];
    
    if (!acc[dayKey]) {
      acc[dayKey] = [];
    }
    acc[dayKey].push(item);
    return acc;
  }, {} as Record<string, ScheduleItem[]>);
}

/**
 * Sort schedule by time
 */
export function sortScheduleByTime(items: ScheduleItem[]): ScheduleItem[] {
  return [...items].sort((a, b) => {
    const timeA = typeof a.startTime === 'string' ? new Date(a.startTime) : a.startTime;
    const timeB = typeof b.startTime === 'string' ? new Date(b.startTime) : b.startTime;
    return timeA.getTime() - timeB.getTime();
  });
}

/**
 * Check for schedule conflicts
 */
export function hasScheduleConflict(item1: ScheduleItem, item2: ScheduleItem): boolean {
  const start1 = typeof item1.startTime === 'string' ? new Date(item1.startTime) : item1.startTime;
  const end1 = typeof item1.endTime === 'string' ? new Date(item1.endTime) : item1.endTime;
  const start2 = typeof item2.startTime === 'string' ? new Date(item2.startTime) : item2.startTime;
  const end2 = typeof item2.endTime === 'string' ? new Date(item2.endTime) : item2.endTime;
  
  return start1 < end2 && end1 > start2;
}

/**
 * Find schedule conflicts
 */
export function findScheduleConflicts(items: ScheduleItem[]): Array<[ScheduleItem, ScheduleItem]> {
  const conflicts: Array<[ScheduleItem, ScheduleItem]> = [];
  
  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      if (hasScheduleConflict(items[i], items[j])) {
        conflicts.push([items[i], items[j]]);
      }
    }
  }
  
  return conflicts;
}

/**
 * Get current/next performance
 */
export function getCurrentOrNextPerformance(items: ScheduleItem[]): ScheduleItem | null {
  const now = new Date();
  const sorted = sortScheduleByTime(items);
  
  // Check for current performance
  const current = sorted.find(item => {
    const start = typeof item.startTime === 'string' ? new Date(item.startTime) : item.startTime;
    const end = typeof item.endTime === 'string' ? new Date(item.endTime) : item.endTime;
    return now >= start && now <= end;
  });
  
  if (current) return current;
  
  // Get next performance
  const next = sorted.find(item => {
    const start = typeof item.startTime === 'string' ? new Date(item.startTime) : item.startTime;
    return now < start;
  });
  
  return next || null;
}

/**
 * Get performances by time range
 */
export function getPerformancesByTimeRange(
  items: ScheduleItem[],
  startTime: Date,
  endTime: Date
): ScheduleItem[] {
  return items.filter(item => {
    const itemStart = typeof item.startTime === 'string' ? new Date(item.startTime) : item.startTime;
    const itemEnd = typeof item.endTime === 'string' ? new Date(item.endTime) : item.endTime;
    return itemStart < endTime && itemEnd > startTime;
  });
}

/**
 * Calculate performance duration
 */
export function getPerformanceDuration(item: ScheduleItem): number {
  const start = typeof item.startTime === 'string' ? new Date(item.startTime) : item.startTime;
  const end = typeof item.endTime === 'string' ? new Date(item.endTime) : item.endTime;
  return (end.getTime() - start.getTime()) / (1000 * 60); // Duration in minutes
}

/**
 * Format performance time range
 */
export function formatPerformanceTime(item: ScheduleItem): string {
  const start = typeof item.startTime === 'string' ? new Date(item.startTime) : item.startTime;
  const end = typeof item.endTime === 'string' ? new Date(item.endTime) : item.endTime;
  
  const formatTime = (date: Date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes}${ampm}`;
  };
  
  return `${formatTime(start)} - ${formatTime(end)}`;
}

/**
 * Create timetable grid
 */
export function createTimetableGrid(
  items: ScheduleItem[],
  stages: Stage[],
  startHour: number = 12,
  endHour: number = 24
): {
  stages: Stage[];
  timeSlots: string[];
  grid: Record<string, Record<string, ScheduleItem | null>>;
} {
  const timeSlots: string[] = [];
  
  // Generate hourly time slots
  for (let hour = startHour; hour <= endHour; hour++) {
    const displayHour = hour % 12 || 12;
    const ampm = hour >= 12 ? 'PM' : 'AM';
    timeSlots.push(`${displayHour}:00${ampm}`);
  }
  
  // Create grid structure
  const grid: Record<string, Record<string, ScheduleItem | null>> = {};
  
  timeSlots.forEach(slot => {
    grid[slot] = {};
    stages.forEach(stage => {
      grid[slot][stage.id] = null;
    });
  });
  
  // Populate grid with performances
  items.forEach(item => {
    const start = typeof item.startTime === 'string' ? new Date(item.startTime) : item.startTime;
    const hour = start.getHours();
    const displayHour = hour % 12 || 12;
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const slot = `${displayHour}:00${ampm}`;
    
    if (grid[slot] && grid[slot][item.stageId] === null) {
      grid[slot][item.stageId] = item;
    }
  });
  
  return { stages, timeSlots, grid };
}

/**
 * Filter schedule by artist
 */
export function filterScheduleByArtist(items: ScheduleItem[], artistId: string): ScheduleItem[] {
  return items.filter(item => item.artistId === artistId);
}

/**
 * Filter schedule by stage
 */
export function filterScheduleByStage(items: ScheduleItem[], stageId: string): ScheduleItem[] {
  return items.filter(item => item.stageId === stageId);
}

/**
 * Filter schedule by genre
 */
export function filterScheduleByGenre(items: ScheduleItem[], genre: string): ScheduleItem[] {
  return items.filter(item => item.genre?.includes(genre));
}

/**
 * Get headliners
 */
export function getHeadliners(items: ScheduleItem[]): ScheduleItem[] {
  return items.filter(item => item.isHeadliner);
}

/**
 * Create personal schedule
 */
export function createPersonalSchedule(
  allItems: ScheduleItem[],
  selectedArtistIds: string[]
): ScheduleItem[] {
  return allItems.filter(item => selectedArtistIds.includes(item.artistId));
}

/**
 * Validate personal schedule (check for conflicts)
 */
export function validatePersonalSchedule(items: ScheduleItem[]): {
  isValid: boolean;
  conflicts: Array<[ScheduleItem, ScheduleItem]>;
} {
  const conflicts = findScheduleConflicts(items);
  return {
    isValid: conflicts.length === 0,
    conflicts,
  };
}

/**
 * Get schedule statistics
 */
export function getScheduleStatistics(items: ScheduleItem[]): {
  totalPerformances: number;
  totalDuration: number;
  averageDuration: number;
  stageCount: number;
  artistCount: number;
  headlinerCount: number;
} {
  const uniqueStages = new Set(items.map(item => item.stageId));
  const uniqueArtists = new Set(items.map(item => item.artistId));
  const totalDuration = items.reduce((sum, item) => sum + getPerformanceDuration(item), 0);
  
  return {
    totalPerformances: items.length,
    totalDuration,
    averageDuration: items.length > 0 ? totalDuration / items.length : 0,
    stageCount: uniqueStages.size,
    artistCount: uniqueArtists.size,
    headlinerCount: items.filter(item => item.isHeadliner).length,
  };
}

/**
 * Export schedule to calendar format
 */
export function exportScheduleToCalendar(items: ScheduleItem[], eventName: string): string {
  const icsEvents = items.map(item => {
    const start = typeof item.startTime === 'string' ? new Date(item.startTime) : item.startTime;
    const end = typeof item.endTime === 'string' ? new Date(item.endTime) : item.endTime;
    
    const formatDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };
    
    return [
      'BEGIN:VEVENT',
      `DTSTART:${formatDate(start)}`,
      `DTEND:${formatDate(end)}`,
      `SUMMARY:${item.artistName} at ${item.stageName}`,
      `LOCATION:${item.stageName}`,
      `DESCRIPTION:${eventName} - ${item.artistName}`,
      'END:VEVENT',
    ].join('\r\n');
  }).join('\r\n');
  
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//GVTEWAY//Schedule//EN',
    icsEvents,
    'END:VCALENDAR',
  ].join('\r\n');
}

/**
 * Download schedule as ICS file
 */
export function downloadScheduleAsICS(items: ScheduleItem[], eventName: string, filename: string = 'schedule.ics'): void {
  const icsContent = exportScheduleToCalendar(items, eventName);
  const blob = new Blob([icsContent], { type: 'text/calendar' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

/**
 * Get time until performance
 */
export function getTimeUntilPerformance(item: ScheduleItem): number {
  const start = typeof item.startTime === 'string' ? new Date(item.startTime) : item.startTime;
  const now = new Date();
  return start.getTime() - now.getTime();
}

/**
 * Is performance happening now
 */
export function isPerformanceNow(item: ScheduleItem): boolean {
  const now = new Date();
  const start = typeof item.startTime === 'string' ? new Date(item.startTime) : item.startTime;
  const end = typeof item.endTime === 'string' ? new Date(item.endTime) : item.endTime;
  return now >= start && now <= end;
}

/**
 * Is performance upcoming
 */
export function isPerformanceUpcoming(item: ScheduleItem): boolean {
  const now = new Date();
  const start = typeof item.startTime === 'string' ? new Date(item.startTime) : item.startTime;
  return now < start;
}

/**
 * Is performance past
 */
export function isPerformancePast(item: ScheduleItem): boolean {
  const now = new Date();
  const end = typeof item.endTime === 'string' ? new Date(item.endTime) : item.endTime;
  return now > end;
}
