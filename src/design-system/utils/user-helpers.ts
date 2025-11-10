/**
 * User Helper Utilities
 * GHXSTSHIP Entertainment Platform User Management
 */

export interface User {
  id: string;
  email: string;
  username?: string;
  displayName?: string;
  avatar?: string;
  role: 'user' | 'admin' | 'organizer' | 'artist';
  preferences?: UserPreferences;
  profile?: UserProfile;
}

export interface UserPreferences {
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  favoriteGenres: string[];
  favoriteArtists: string[];
  theme: 'light' | 'dark' | 'auto';
  language: string;
}

export interface UserProfile {
  bio?: string;
  location?: string;
  website?: string;
  socialLinks?: {
    instagram?: string;
    twitter?: string;
    facebook?: string;
  };
  attendedEvents: string[];
  upcomingEvents: string[];
}

/**
 * Get user initials
 */
export function getUserInitials(user: User): string {
  if (user.displayName) {
    return user.displayName
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }

  if (user.username) {
    return user.username.slice(0, 2).toUpperCase();
  }

  return user.email.slice(0, 2).toUpperCase();
}

/**
 * Get user display name
 */
export function getUserDisplayName(user: User): string {
  return user.displayName || user.username || user.email.split('@')[0];
}

/**
 * Format user display
 */
export function formatUserDisplay(user: User): string {
  return getUserDisplayName(user).toUpperCase();
}

/**
 * Check user role
 */
export function hasRole(user: User, role: User['role']): boolean {
  return user.role === role;
}

/**
 * Check if user is admin
 */
export function isAdmin(user: User): boolean {
  return hasRole(user, 'admin');
}

/**
 * Check if user is organizer
 */
export function isOrganizer(user: User): boolean {
  return hasRole(user, 'organizer');
}

/**
 * Check if user is artist
 */
export function isArtist(user: User): boolean {
  return hasRole(user, 'artist');
}

/**
 * Get user permissions
 */
export function getUserPermissions(user: User): string[] {
  const basePermissions = ['view_events', 'purchase_tickets', 'view_profile'];

  const rolePermissions: Record<User['role'], string[]> = {
    user: basePermissions,
    artist: [...basePermissions, 'manage_profile', 'view_analytics'],
    organizer: [...basePermissions, 'create_events', 'manage_events', 'view_sales'],
    admin: [...basePermissions, 'manage_users', 'manage_events', 'manage_content', 'view_analytics', 'manage_settings'],
  };

  return rolePermissions[user.role];
}

/**
 * Check user permission
 */
export function hasPermission(user: User, permission: string): boolean {
  return getUserPermissions(user).includes(permission);
}

/**
 * Update user preferences
 */
export function updateUserPreferences(
  user: User,
  updates: Partial<UserPreferences>
): User {
  return {
    ...user,
    preferences: {
      ...user.preferences,
      ...updates,
    } as UserPreferences,
  };
}

/**
 * Toggle favorite artist
 */
export function toggleFavoriteArtist(user: User, artistId: string): User {
  const favorites = user.preferences?.favoriteArtists || [];
  const newFavorites = favorites.includes(artistId)
    ? favorites.filter(id => id !== artistId)
    : [...favorites, artistId];

  return updateUserPreferences(user, {
    favoriteArtists: newFavorites,
  });
}

/**
 * Toggle favorite genre
 */
export function toggleFavoriteGenre(user: User, genre: string): User {
  const favorites = user.preferences?.favoriteGenres || [];
  const newFavorites = favorites.includes(genre)
    ? favorites.filter(g => g !== genre)
    : [...favorites, genre];

  return updateUserPreferences(user, {
    favoriteGenres: newFavorites,
  });
}

/**
 * Check if artist is favorited
 */
export function isArtistFavorited(user: User, artistId: string): boolean {
  return user.preferences?.favoriteArtists?.includes(artistId) || false;
}

/**
 * Check if genre is favorited
 */
export function isGenreFavorited(user: User, genre: string): boolean {
  return user.preferences?.favoriteGenres?.includes(genre) || false;
}

/**
 * Get user event history
 */
export function getUserEventHistory(user: User): {
  attended: string[];
  upcoming: string[];
  total: number;
} {
  const attended = user.profile?.attendedEvents || [];
  const upcoming = user.profile?.upcomingEvents || [];

  return {
    attended,
    upcoming,
    total: attended.length + upcoming.length,
  };
}

/**
 * Add event to user history
 */
export function addEventToHistory(user: User, eventId: string, type: 'attended' | 'upcoming'): User {
  const profile = user.profile || { attendedEvents: [], upcomingEvents: [] };

  if (type === 'attended') {
    return {
      ...user,
      profile: {
        ...profile,
        attendedEvents: [...(profile.attendedEvents || []), eventId],
      },
    };
  }

  return {
    ...user,
    profile: {
      ...profile,
      upcomingEvents: [...(profile.upcomingEvents || []), eventId],
    },
  };
}

/**
 * Validate username
 */
export function validateUsername(username: string): {
  isValid: boolean;
  error?: string;
} {
  if (username.length < 3) {
    return { isValid: false, error: 'Username must be at least 3 characters' };
  }

  if (username.length > 20) {
    return { isValid: false, error: 'Username must be less than 20 characters' };
  }

  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    return { isValid: false, error: 'Username can only contain letters, numbers, hyphens, and underscores' };
  }

  return { isValid: true };
}

/**
 * Sanitize username
 */
export function sanitizeUsername(username: string): string {
  return username
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '')
    .slice(0, 20);
}

/**
 * Generate username from email
 */
export function generateUsernameFromEmail(email: string): string {
  const base = email.split('@')[0];
  return sanitizeUsername(base);
}

/**
 * Format user join date
 */
export function formatUserJoinDate(joinDate: Date | string): string {
  const date = typeof joinDate === 'string' ? new Date(joinDate) : joinDate;
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

  return `MEMBER SINCE ${months[date.getMonth()]} ${date.getFullYear()}`;
}

/**
 * Get user activity level
 */
export function getUserActivityLevel(user: User): 'new' | 'active' | 'veteran' {
  const eventCount = (user.profile?.attendedEvents?.length || 0) + (user.profile?.upcomingEvents?.length || 0);

  if (eventCount === 0) return 'new';
  if (eventCount < 5) return 'active';
  return 'veteran';
}

/**
 * Get user badge
 */
export function getUserBadge(user: User): string {
  const level = getUserActivityLevel(user);

  const badges = {
    new: 'NEWCOMER',
    active: 'REGULAR',
    veteran: 'VIP',
  };

  return badges[level];
}

/**
 * Check notification preference
 */
export function hasNotificationEnabled(user: User, type: 'email' | 'push' | 'sms'): boolean {
  return user.preferences?.notifications?.[type] || false;
}

/**
 * Update notification preferences
 */
export function updateNotificationPreferences(
  user: User,
  updates: Partial<UserPreferences['notifications']>
): User {
  return updateUserPreferences(user, {
    notifications: {
      ...(user.preferences?.notifications || { email: false, push: false, sms: false }),
      ...updates,
    },
  });
}

/**
 * Get recommended events for user
 */
export function getRecommendedEventIds(user: User, allEventIds: string[]): string[] {
  // Simple recommendation based on favorites
  // In production, use a proper recommendation algorithm
  return allEventIds.slice(0, 10);
}

/**
 * Calculate user engagement score
 */
export function calculateEngagementScore(user: User): number {
  let score = 0;

  // Events attended
  score += (user.profile?.attendedEvents?.length || 0) * 10;

  // Upcoming events
  score += (user.profile?.upcomingEvents?.length || 0) * 5;

  // Favorite artists
  score += (user.preferences?.favoriteArtists?.length || 0) * 2;

  // Favorite genres
  score += (user.preferences?.favoriteGenres?.length || 0) * 1;

  // Profile completeness
  if (user.displayName) score += 5;
  if (user.avatar) score += 5;
  if (user.profile?.bio) score += 5;

  return Math.min(score, 100);
}

/**
 * Format engagement score display
 */
export function formatEngagementScore(score: number): string {
  return `${score}% ENGAGED`;
}

/**
 * Mask user email
 */
export function maskUserEmail(email: string): string {
  const [username, domain] = email.split('@');
  const visibleChars = Math.min(3, Math.floor(username.length / 2));
  const masked = username.slice(0, visibleChars) + '*'.repeat(username.length - visibleChars);
  return `${masked}@${domain}`;
}

/**
 * Get user avatar URL or placeholder
 */
export function getUserAvatarUrl(user: User, size: number = 128): string {
  if (user.avatar) return user.avatar;

  // Generate placeholder with initials
  const initials = getUserInitials(user);
  return `https://ui-avatars.com/api/?name=${initials}&size=${size}&background=000000&color=FFFFFF&bold=true`;
}
