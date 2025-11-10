/**
 * Event Helper Utilities
 * GHXSTSHIP Entertainment Platform Event Management
 */

import { formatDateTime, formatTime, formatVenueInfo } from './typography';

export interface Event {
  id: string;
  name: string;
  slug: string;
  startDate: Date | string;
  endDate?: Date | string;
  venueName: string;
  venueLocation: string;
  status: 'upcoming' | 'on-sale' | 'sold-out' | 'past';
  ageRestriction?: string;
  ticketTypes?: TicketType[];
}

export interface TicketType {
  id: string;
  name: string;
  price: number;
  quantityAvailable: number;
  quantitySold: number;
  saleStartDate?: Date | string;
  saleEndDate?: Date | string;
}

export interface Artist {
  id: string;
  name: string;
  slug: string;
  genre: string[];
  profileImage?: string;
}

export interface SetTime {
  id: string;
  artistId: string;
  stageId: string;
  startTime: Date | string;
  endTime: Date | string;
}

/**
 * Format event date range
 */
export function formatEventDateRange(startDate: Date | string, endDate?: Date | string): string {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const end = endDate ? (typeof endDate === 'string' ? new Date(endDate) : endDate) : null;
  
  if (!end || start.toDateString() === end.toDateString()) {
    return formatDateTime(start);
  }
  
  const startFormatted = formatDateTime(start);
  const endDay = end.getDate();
  
  return `${startFormatted} - ${endDay}`;
}

/**
 * Format event time range
 */
export function formatEventTimeRange(startTime: Date | string, endTime: Date | string): string {
  const start = typeof startTime === 'string' ? new Date(startTime) : startTime;
  const end = typeof endTime === 'string' ? new Date(endTime) : endTime;
  
  return `${formatTime(start)} - ${formatTime(end)}`;
}

/**
 * Format event venue
 */
export function formatEventVenue(venueName: string, location: string): string {
  return formatVenueInfo(venueName, location);
}

/**
 * Check if event is upcoming
 */
export function isEventUpcoming(startDate: Date | string): boolean {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  return start > new Date();
}

/**
 * Check if event is past
 */
export function isEventPast(endDate: Date | string): boolean {
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
  return end < new Date();
}

/**
 * Check if event is happening now
 */
export function isEventLive(startDate: Date | string, endDate: Date | string): boolean {
  const now = new Date();
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
  
  return now >= start && now <= end;
}

/**
 * Check if tickets are on sale
 */
export function areTicketsOnSale(ticketType: TicketType): boolean {
  const now = new Date();
  
  if (ticketType.saleStartDate) {
    const start = typeof ticketType.saleStartDate === 'string' 
      ? new Date(ticketType.saleStartDate) 
      : ticketType.saleStartDate;
    if (now < start) return false;
  }
  
  if (ticketType.saleEndDate) {
    const end = typeof ticketType.saleEndDate === 'string' 
      ? new Date(ticketType.saleEndDate) 
      : ticketType.saleEndDate;
    if (now > end) return false;
  }
  
  return ticketType.quantityAvailable > ticketType.quantitySold;
}

/**
 * Check if event is sold out
 */
export function isEventSoldOut(event: Event): boolean {
  if (!event.ticketTypes || event.ticketTypes.length === 0) {
    return event.status === 'sold-out';
  }
  
  return event.ticketTypes.every(
    ticket => ticket.quantitySold >= ticket.quantityAvailable
  );
}

/**
 * Get event status badge text
 */
export function getEventStatusBadge(event: Event): string | null {
  if (isEventSoldOut(event)) return 'SOLD OUT';
  if (event.status === 'on-sale') return 'ON SALE';
  if (isEventPast(event.endDate || event.startDate)) return 'PAST EVENT';
  if (isEventLive(event.startDate, event.endDate || event.startDate)) return 'LIVE NOW';
  return null;
}

/**
 * Calculate ticket availability percentage
 */
export function getTicketAvailability(ticketType: TicketType): number {
  if (ticketType.quantityAvailable === 0) return 0;
  const remaining = ticketType.quantityAvailable - ticketType.quantitySold;
  return (remaining / ticketType.quantityAvailable) * 100;
}

/**
 * Get ticket urgency level
 */
export function getTicketUrgency(ticketType: TicketType): 'low' | 'medium' | 'high' | 'critical' {
  const availability = getTicketAvailability(ticketType);
  
  if (availability <= 10) return 'critical';
  if (availability <= 25) return 'high';
  if (availability <= 50) return 'medium';
  return 'low';
}

/**
 * Format ticket price
 */
export function formatTicketPrice(price: number, currency: string = 'USD'): string {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  
  return formatter.format(price);
}

/**
 * Calculate total ticket price
 */
export function calculateTotalPrice(
  ticketType: TicketType,
  quantity: number,
  fees: number = 0
): number {
  return ticketType.price * quantity + fees;
}

/**
 * Sort events by date
 */
export function sortEventsByDate(
  events: Event[],
  direction: 'asc' | 'desc' = 'asc'
): Event[] {
  return [...events].sort((a, b) => {
    const dateA = typeof a.startDate === 'string' ? new Date(a.startDate) : a.startDate;
    const dateB = typeof b.startDate === 'string' ? new Date(b.startDate) : b.startDate;
    
    return direction === 'asc' 
      ? dateA.getTime() - dateB.getTime()
      : dateB.getTime() - dateA.getTime();
  });
}

/**
 * Filter events by status
 */
export function filterEventsByStatus(
  events: Event[],
  status: Event['status'] | Event['status'][]
): Event[] {
  const statuses = Array.isArray(status) ? status : [status];
  return events.filter(event => statuses.includes(event.status));
}

/**
 * Filter upcoming events
 */
export function getUpcomingEvents(events: Event[]): Event[] {
  return events.filter(event => isEventUpcoming(event.startDate));
}

/**
 * Filter past events
 */
export function getPastEvents(events: Event[]): Event[] {
  return events.filter(event => isEventPast(event.endDate || event.startDate));
}

/**
 * Group events by month
 */
export function groupEventsByMonth(events: Event[]): Record<string, Event[]> {
  const grouped: Record<string, Event[]> = {};
  
  events.forEach(event => {
    const date = typeof event.startDate === 'string' ? new Date(event.startDate) : event.startDate;
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (!grouped[monthKey]) {
      grouped[monthKey] = [];
    }
    
    grouped[monthKey].push(event);
  });
  
  return grouped;
}

/**
 * Search events
 */
export function searchEvents(events: Event[], query: string): Event[] {
  const lowerQuery = query.toLowerCase();
  
  return events.filter(event => 
    event.name.toLowerCase().includes(lowerQuery) ||
    event.venueName.toLowerCase().includes(lowerQuery) ||
    event.venueLocation.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Generate event URL slug
 */
export function generateEventSlug(eventName: string): string {
  return eventName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Format age restriction
 */
export function formatAgeRestriction(restriction?: string): string {
  if (!restriction) return 'ALL AGES';
  return restriction.toUpperCase();
}

/**
 * Calculate event duration in hours
 */
export function getEventDuration(startDate: Date | string, endDate: Date | string): number {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
  
  return (end.getTime() - start.getTime()) / (1000 * 60 * 60);
}

/**
 * Get days until event
 */
export function getDaysUntilEvent(startDate: Date | string): number {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const now = new Date();
  const diff = start.getTime() - now.getTime();
  
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

/**
 * Format countdown
 */
export function formatCountdown(startDate: Date | string): string {
  const days = getDaysUntilEvent(startDate);
  
  if (days < 0) return 'EVENT STARTED';
  if (days === 0) return 'TODAY';
  if (days === 1) return 'TOMORROW';
  if (days < 7) return `${days} DAYS`;
  if (days < 30) return `${Math.floor(days / 7)} WEEKS`;
  
  return `${Math.floor(days / 30)} MONTHS`;
}

/**
 * Sort set times by start time
 */
export function sortSetTimes(setTimes: SetTime[]): SetTime[] {
  return [...setTimes].sort((a, b) => {
    const timeA = typeof a.startTime === 'string' ? new Date(a.startTime) : a.startTime;
    const timeB = typeof b.startTime === 'string' ? new Date(b.startTime) : b.startTime;
    
    return timeA.getTime() - timeB.getTime();
  });
}

/**
 * Group set times by stage
 */
export function groupSetTimesByStage(setTimes: SetTime[]): Record<string, SetTime[]> {
  const grouped: Record<string, SetTime[]> = {};
  
  setTimes.forEach(setTime => {
    if (!grouped[setTime.stageId]) {
      grouped[setTime.stageId] = [];
    }
    
    grouped[setTime.stageId].push(setTime);
  });
  
  return grouped;
}

/**
 * Check for set time conflicts
 */
export function hasSetTimeConflict(setTime1: SetTime, setTime2: SetTime): boolean {
  const start1 = typeof setTime1.startTime === 'string' ? new Date(setTime1.startTime) : setTime1.startTime;
  const end1 = typeof setTime1.endTime === 'string' ? new Date(setTime1.endTime) : setTime1.endTime;
  const start2 = typeof setTime2.startTime === 'string' ? new Date(setTime2.startTime) : setTime2.startTime;
  const end2 = typeof setTime2.endTime === 'string' ? new Date(setTime2.endTime) : setTime2.endTime;
  
  return (start1 < end2 && end1 > start2);
}

/**
 * Format artist genres
 */
export function formatArtistGenres(genres: string[]): string {
  return genres.map(g => g.toUpperCase()).join(' // ');
}

/**
 * Generate share URL
 */
export function generateShareUrl(event: Event, baseUrl: string = ''): string {
  return `${baseUrl}/events/${event.slug}`;
}

/**
 * Generate calendar event data
 */
export function generateCalendarEvent(event: Event): {
  title: string;
  start: string;
  end: string;
  location: string;
  description: string;
} {
  const start = typeof event.startDate === 'string' ? new Date(event.startDate) : event.startDate;
  const end = event.endDate 
    ? (typeof event.endDate === 'string' ? new Date(event.endDate) : event.endDate)
    : start;
  
  return {
    title: event.name,
    start: start.toISOString(),
    end: end.toISOString(),
    location: `${event.venueName}, ${event.venueLocation}`,
    description: `${event.name} at ${event.venueName}`,
  };
}
