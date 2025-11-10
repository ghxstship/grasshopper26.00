/**
 * Venue Helper Utilities
 * GHXSTSHIP Entertainment Platform Venue & Map Management
 */

export interface Venue {
  id: string;
  name: string;
  address: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  capacity?: number;
  ageRestriction?: string;
  amenities?: string[];
}

export interface VenueStage {
  id: string;
  name: string;
  venueId: string;
  coordinates?: {
    x: number;
    y: number;
  };
  capacity?: number;
  type?: 'main' | 'secondary' | 'underground' | 'outdoor';
}

export interface MapMarker {
  id: string;
  type: 'stage' | 'entrance' | 'exit' | 'restroom' | 'food' | 'medical' | 'merchandise' | 'parking';
  name: string;
  coordinates: {
    x: number;
    y: number;
  };
  icon?: string;
}

/**
 * Format venue address
 */
export function formatVenueAddress(venue: Venue): string {
  const { address } = venue;
  const parts = [
    address.line1,
    address.line2,
    `${address.city}, ${address.state} ${address.postalCode}`,
    address.country,
  ].filter(Boolean);
  
  return parts.join(', ');
}

/**
 * Format venue address for display (GHXSTSHIP style)
 */
export function formatVenueAddressDisplay(venue: Venue): string {
  const { address } = venue;
  return `${venue.name.toUpperCase()} // ${address.city.toUpperCase()}, ${address.state.toUpperCase()}`;
}

/**
 * Calculate distance between coordinates
 */
export function calculateDistance(
  coord1: { latitude: number; longitude: number },
  coord2: { latitude: number; longitude: number }
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRadians(coord2.latitude - coord1.latitude);
  const dLon = toRadians(coord2.longitude - coord1.longitude);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(coord1.latitude)) *
    Math.cos(toRadians(coord2.latitude)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Format distance
 */
export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)}M`;
  }
  return `${km.toFixed(1)}KM`;
}

/**
 * Get directions URL
 */
export function getDirectionsURL(venue: Venue, from?: { latitude: number; longitude: number }): string {
  if (!venue.coordinates) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(formatVenueAddress(venue))}`;
  }
  
  const destination = `${venue.coordinates.latitude},${venue.coordinates.longitude}`;
  
  if (from) {
    const origin = `${from.latitude},${from.longitude}`;
    return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}`;
  }
  
  return `https://www.google.com/maps/search/?api=1&query=${destination}`;
}

/**
 * Get map embed URL
 */
export function getMapEmbedURL(venue: Venue, zoom: number = 15): string {
  if (!venue.coordinates) return '';
  
  return `https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=${venue.coordinates.latitude},${venue.coordinates.longitude}&zoom=${zoom}`;
}

/**
 * Group stages by type
 */
export function groupStagesByType(stages: VenueStage[]): Record<string, VenueStage[]> {
  return stages.reduce((acc, stage) => {
    const type = stage.type || 'other';
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(stage);
    return acc;
  }, {} as Record<string, VenueStage[]>);
}

/**
 * Find nearest marker
 */
export function findNearestMarker(
  position: { x: number; y: number },
  markers: MapMarker[]
): MapMarker | null {
  if (markers.length === 0) return null;
  
  let nearest = markers[0];
  let minDistance = calculateMapDistance(position, markers[0].coordinates);
  
  markers.forEach(marker => {
    const distance = calculateMapDistance(position, marker.coordinates);
    if (distance < minDistance) {
      minDistance = distance;
      nearest = marker;
    }
  });
  
  return nearest;
}

/**
 * Calculate distance on map (2D)
 */
export function calculateMapDistance(
  point1: { x: number; y: number },
  point2: { x: number; y: number }
): number {
  const dx = point2.x - point1.x;
  const dy = point2.y - point1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Filter markers by type
 */
export function filterMarkersByType(markers: MapMarker[], type: MapMarker['type']): MapMarker[] {
  return markers.filter(marker => marker.type === type);
}

/**
 * Get marker icon (GHXSTSHIP geometric)
 */
export function getMarkerIcon(type: MapMarker['type']): string {
  const icons: Record<MapMarker['type'], string> = {
    stage: '▲',
    entrance: '→',
    exit: '←',
    restroom: '◼',
    food: '●',
    medical: '+',
    merchandise: '■',
    parking: 'P',
  };
  
  return icons[type];
}

/**
 * Validate venue capacity
 */
export function isVenueAtCapacity(currentAttendance: number, venue: Venue): boolean {
  if (!venue.capacity) return false;
  return currentAttendance >= venue.capacity;
}

/**
 * Calculate venue utilization
 */
export function calculateVenueUtilization(currentAttendance: number, venue: Venue): number {
  if (!venue.capacity) return 0;
  return (currentAttendance / venue.capacity) * 100;
}

/**
 * Format capacity display
 */
export function formatCapacityDisplay(venue: Venue): string {
  if (!venue.capacity) return 'CAPACITY: UNLIMITED';
  return `CAPACITY: ${venue.capacity.toLocaleString()}`;
}

/**
 * Check age restriction
 */
export function meetsAgeRestriction(age: number, venue: Venue): boolean {
  if (!venue.ageRestriction) return true;
  
  const restriction = venue.ageRestriction.toLowerCase();
  
  if (restriction.includes('21+')) return age >= 21;
  if (restriction.includes('18+')) return age >= 18;
  if (restriction.includes('all ages')) return true;
  
  return true;
}

/**
 * Format age restriction display
 */
export function formatAgeRestrictionDisplay(venue: Venue): string {
  return venue.ageRestriction?.toUpperCase() || 'ALL AGES';
}

/**
 * Get venue amenities list
 */
export function formatAmenitiesList(venue: Venue): string {
  if (!venue.amenities || venue.amenities.length === 0) return 'NO AMENITIES LISTED';
  return venue.amenities.map(a => a.toUpperCase()).join(' // ');
}

/**
 * Create venue map SVG
 */
export function createVenueMapSVG(
  width: number,
  height: number,
  stages: VenueStage[],
  markers: MapMarker[]
): string {
  const stageElements = stages.map(stage => {
    if (!stage.coordinates) return '';
    
    return `
      <g transform="translate(${stage.coordinates.x}, ${stage.coordinates.y})">
        <rect x="-30" y="-30" width="60" height="60" fill="none" stroke="#000000" stroke-width="3"/>
        <text x="0" y="5" text-anchor="middle" font-family="Bebas Neue" font-size="12" fill="#000000">
          ${stage.name.toUpperCase()}
        </text>
      </g>
    `;
  }).join('');
  
  const markerElements = markers.map(marker => {
    return `
      <g transform="translate(${marker.coordinates.x}, ${marker.coordinates.y})">
        <circle r="8" fill="#000000"/>
        <text x="0" y="20" text-anchor="middle" font-family="Share Tech Mono" font-size="10" fill="#000000">
          ${marker.name.toUpperCase()}
        </text>
      </g>
    `;
  }).join('');
  
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <rect width="100%" height="100%" fill="#FFFFFF"/>
      ${stageElements}
      ${markerElements}
    </svg>
  `;
}

/**
 * Get parking information
 */
export function getParkingInfo(markers: MapMarker[]): MapMarker[] {
  return filterMarkersByType(markers, 'parking');
}

/**
 * Get entrance/exit information
 */
export function getEntranceExitInfo(markers: MapMarker[]): {
  entrances: MapMarker[];
  exits: MapMarker[];
} {
  return {
    entrances: filterMarkersByType(markers, 'entrance'),
    exits: filterMarkersByType(markers, 'exit'),
  };
}

/**
 * Calculate walking time between points
 */
export function calculateWalkingTime(
  point1: { x: number; y: number },
  point2: { x: number; y: number },
  walkingSpeedMps: number = 1.4 // meters per second
): number {
  const distance = calculateMapDistance(point1, point2);
  return Math.ceil(distance / walkingSpeedMps / 60); // minutes
}

/**
 * Find optimal route between stages
 */
export function findOptimalRoute(
  start: VenueStage,
  end: VenueStage,
  allStages: VenueStage[]
): VenueStage[] {
  // Simple direct route - in production, implement proper pathfinding
  return [start, end];
}

/**
 * Get venue timezone
 */
export function getVenueTimezone(venue: Venue): string {
  // Map state to timezone - simplified
  const timezones: Record<string, string> = {
    CA: 'America/Los_Angeles',
    NY: 'America/New_York',
    TX: 'America/Chicago',
    FL: 'America/New_York',
    NV: 'America/Los_Angeles',
  };
  
  return timezones[venue.address.state] || 'America/New_York';
}
