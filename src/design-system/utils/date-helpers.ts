/**
 * Date Helper Utilities
 * GHXSTSHIP Entertainment Platform Date Management
 */

/**
 * Format date to GHXSTSHIP style
 */
export function formatGHXSTSHIPDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  
  return `${days[d.getDay()]}, ${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

/**
 * Format time to GHXSTSHIP style
 */
export function formatGHXSTSHIPTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const hours = d.getHours();
  const minutes = d.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  
  return `${displayHours}:${minutes}${ampm}`;
}

/**
 * Format date range
 */
export function formatDateRange(start: Date | string, end: Date | string): string {
  const startDate = typeof start === 'string' ? new Date(start) : start;
  const endDate = typeof end === 'string' ? new Date(end) : end;
  
  if (startDate.toDateString() === endDate.toDateString()) {
    return formatGHXSTSHIPDate(startDate);
  }
  
  return `${formatGHXSTSHIPDate(startDate)} - ${formatGHXSTSHIPDate(endDate)}`;
}

/**
 * Get relative time
 */
export function getRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffSecs < 60) return 'JUST NOW';
  if (diffMins < 60) return `${diffMins} MIN AGO`;
  if (diffHours < 24) return `${diffHours} HR AGO`;
  if (diffDays < 7) return `${diffDays} DAY${diffDays > 1 ? 'S' : ''} AGO`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} WEEK${Math.floor(diffDays / 7) > 1 ? 'S' : ''} AGO`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} MONTH${Math.floor(diffDays / 30) > 1 ? 'S' : ''} AGO`;
  
  return `${Math.floor(diffDays / 365)} YEAR${Math.floor(diffDays / 365) > 1 ? 'S' : ''} AGO`;
}

/**
 * Get time until
 */
export function getTimeUntil(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = d.getTime() - now.getTime();
  
  if (diffMs < 0) return 'PAST';
  
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffDays === 0) return 'TODAY';
  if (diffDays === 1) return 'TOMORROW';
  if (diffDays < 7) return `IN ${diffDays} DAYS`;
  if (diffDays < 30) return `IN ${Math.floor(diffDays / 7)} WEEKS`;
  if (diffDays < 365) return `IN ${Math.floor(diffDays / 30)} MONTHS`;
  
  return `IN ${Math.floor(diffDays / 365)} YEARS`;
}

/**
 * Check if date is today
 */
export function isToday(date: Date | string): boolean {
  const d = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();
  
  return d.toDateString() === today.toDateString();
}

/**
 * Check if date is tomorrow
 */
export function isTomorrow(date: Date | string): boolean {
  const d = typeof date === 'string' ? new Date(date) : date;
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  return d.toDateString() === tomorrow.toDateString();
}

/**
 * Check if date is this week
 */
export function isThisWeek(date: Date | string): boolean {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  weekStart.setHours(0, 0, 0, 0);
  
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 7);
  
  return d >= weekStart && d < weekEnd;
}

/**
 * Check if date is this month
 */
export function isThisMonth(date: Date | string): boolean {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
}

/**
 * Get day of week
 */
export function getDayOfWeek(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
  
  return days[d.getDay()];
}

/**
 * Get month name
 */
export function getMonthName(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const months = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];
  
  return months[d.getMonth()];
}

/**
 * Add days to date
 */
export function addDays(date: Date | string, days: number): Date {
  const d = typeof date === 'string' ? new Date(date) : new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

/**
 * Add months to date
 */
export function addMonths(date: Date | string, months: number): Date {
  const d = typeof date === 'string' ? new Date(date) : new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

/**
 * Add years to date
 */
export function addYears(date: Date | string, years: number): Date {
  const d = typeof date === 'string' ? new Date(date) : new Date(date);
  d.setFullYear(d.getFullYear() + years);
  return d;
}

/**
 * Get start of day
 */
export function startOfDay(date: Date | string): Date {
  const d = typeof date === 'string' ? new Date(date) : new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Get end of day
 */
export function endOfDay(date: Date | string): Date {
  const d = typeof date === 'string' ? new Date(date) : new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

/**
 * Get start of week
 */
export function startOfWeek(date: Date | string): Date {
  const d = typeof date === 'string' ? new Date(date) : new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day;
  return new Date(d.setDate(diff));
}

/**
 * Get end of week
 */
export function endOfWeek(date: Date | string): Date {
  const d = startOfWeek(date);
  return new Date(d.setDate(d.getDate() + 6));
}

/**
 * Get start of month
 */
export function startOfMonth(date: Date | string): Date {
  const d = typeof date === 'string' ? new Date(date) : new Date(date);
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

/**
 * Get end of month
 */
export function endOfMonth(date: Date | string): Date {
  const d = typeof date === 'string' ? new Date(date) : new Date(date);
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}

/**
 * Get days in month
 */
export function getDaysInMonth(date: Date | string): number {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
}

/**
 * Is leap year
 */
export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

/**
 * Get age from birthdate
 */
export function getAge(birthdate: Date | string): number {
  const birth = typeof birthdate === 'string' ? new Date(birthdate) : birthdate;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
}

/**
 * Format duration
 */
export function formatDuration(milliseconds: number): string {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days}D ${hours % 24}H`;
  if (hours > 0) return `${hours}H ${minutes % 60}M`;
  if (minutes > 0) return `${minutes}M ${seconds % 60}S`;
  
  return `${seconds}S`;
}

/**
 * Parse ISO date
 */
export function parseISODate(isoString: string): Date {
  return new Date(isoString);
}

/**
 * Format to ISO
 */
export function formatToISO(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString();
}

/**
 * Get timezone offset
 */
export function getTimezoneOffset(date: Date | string = new Date()): number {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.getTimezoneOffset();
}

/**
 * Convert to timezone
 */
export function convertToTimezone(date: Date | string, timezone: string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString('en-US', { timeZone: timezone });
}

/**
 * Get calendar weeks in month
 */
export function getCalendarWeeks(date: Date | string): Date[][] {
  const d = typeof date === 'string' ? new Date(date) : date;
  const firstDay = startOfMonth(d);
  const lastDay = endOfMonth(d);
  
  const weeks: Date[][] = [];
  let currentWeek: Date[] = [];
  
  // Fill in days before month starts
  const firstDayOfWeek = firstDay.getDay();
  for (let i = 0; i < firstDayOfWeek; i++) {
    currentWeek.push(addDays(firstDay, i - firstDayOfWeek));
  }
  
  // Fill in month days
  const daysInMonth = getDaysInMonth(d);
  for (let i = 0; i < daysInMonth; i++) {
    currentWeek.push(addDays(firstDay, i));
    
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }
  
  // Fill in days after month ends
  if (currentWeek.length > 0) {
    const remaining = 7 - currentWeek.length;
    for (let i = 1; i <= remaining; i++) {
      currentWeek.push(addDays(lastDay, i));
    }
    weeks.push(currentWeek);
  }
  
  return weeks;
}

/**
 * Compare dates
 */
export function compareDates(date1: Date | string, date2: Date | string): number {
  const d1 = typeof date1 === 'string' ? new Date(date1) : date1;
  const d2 = typeof date2 === 'string' ? new Date(date2) : date2;
  
  return d1.getTime() - d2.getTime();
}

/**
 * Is date between
 */
export function isDateBetween(date: Date | string, start: Date | string, end: Date | string): boolean {
  const d = typeof date === 'string' ? new Date(date) : date;
  const s = typeof start === 'string' ? new Date(start) : start;
  const e = typeof end === 'string' ? new Date(end) : end;
  
  return d >= s && d <= e;
}
