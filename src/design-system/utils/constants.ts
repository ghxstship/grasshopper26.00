/**
 * Design System Constants
 * GHXSTSHIP Entertainment Platform Constants
 */

/**
 * Brand constants
 */
export const BRAND = {
  NAME: 'GVTEWAY',
  TAGLINE: 'CONTEMPORARY MINIMAL POP ART',
  SUPPORT_EMAIL: 'support@gvteway.com',
  WEBSITE: 'https://gvteway.com',
} as const;

/**
 * Color constants (monochromatic only)
 */
export const COLORS = {
  BLACK: '#000000',
  WHITE: '#FFFFFF',
  GREY_100: '#F5F5F5',
  GREY_200: '#E5E5E5',
  GREY_300: '#D4D4D4',
  GREY_400: '#A3A3A3',
  GREY_500: '#737373',
  GREY_600: '#525252',
  GREY_700: '#404040',
  GREY_800: '#262626',
  GREY_900: '#171717',
} as const;

/**
 * Typography constants
 */
export const FONTS = {
  HERO: 'Anton',
  HEADING: 'Bebas Neue',
  BODY: 'Share Tech',
  MONO: 'Share Tech Mono',
} as const;

/**
 * Border constants
 */
export const BORDERS = {
  WIDTH: 3,
  RADIUS: 0,
  STYLE: 'solid',
} as const;

/**
 * Shadow constants (hard geometric only)
 */
export const SHADOWS = {
  SMALL: '4px 4px 0 #000000',
  MEDIUM: '8px 8px 0 #000000',
  LARGE: '12px 12px 0 #000000',
  XLARGE: '16px 16px 0 #000000',
} as const;

/**
 * Spacing constants
 */
export const SPACING = {
  XS: 4,
  SM: 8,
  MD: 16,
  LG: 24,
  XL: 32,
  XXL: 48,
  XXXL: 64,
} as const;

/**
 * Breakpoint constants
 */
export const BREAKPOINTS = {
  XS: 320,
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  XXL: 1536,
  XXXL: 1920,
  XXXXL: 2560,
} as const;

/**
 * Animation constants
 */
export const ANIMATIONS = {
  DURATION: {
    INSTANT: 0,
    FAST: 150,
    NORMAL: 300,
    SLOW: 500,
  },
  EASING: {
    LINEAR: 'linear',
    EASE: 'ease',
    EASE_IN: 'ease-in',
    EASE_OUT: 'ease-out',
    EASE_IN_OUT: 'ease-in-out',
  },
} as const;

/**
 * Z-index constants
 */
export const Z_INDEX_LAYERS = {
  DROPDOWN: 1000,
  STICKY: 1020,
  FIXED: 1030,
  MODAL_BACKDROP: 1040,
  MODAL: 1050,
  POPOVER: 1060,
  TOOLTIP: 1070,
} as const;

/**
 * Layout constants
 */
export const LAYOUT = {
  MAX_WIDTH: 1920,
  CONTAINER_PADDING: 20,
  GRID_COLUMNS: 12,
  GRID_GAP: 24,
} as const;

/**
 * Form constants
 */
export const FORM = {
  INPUT_HEIGHT: 48,
  TEXTAREA_MIN_HEIGHT: 120,
  BUTTON_HEIGHT: 48,
  CHECKBOX_SIZE: 24,
  RADIO_SIZE: 24,
} as const;

/**
 * Image constants
 */
export const IMAGE = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  THUMBNAIL_SIZE: 300,
  PREVIEW_SIZE: 800,
} as const;

/**
 * Pagination constants
 */
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
} as const;

/**
 * API constants
 */
export const API = {
  TIMEOUT: 30000,
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,
} as const;

/**
 * Cache constants
 */
export const CACHE = {
  TTL: 5 * 60 * 1000, // 5 minutes
  MAX_SIZE: 100,
} as const;

/**
 * Rate limit constants
 */
export const RATE_LIMIT = {
  MAX_REQUESTS: 100,
  WINDOW_MS: 60000, // 1 minute
} as const;

/**
 * Validation constants
 */
export const VALIDATION = {
  MIN_PASSWORD_LENGTH: 8,
  MAX_PASSWORD_LENGTH: 128,
  MIN_USERNAME_LENGTH: 3,
  MAX_USERNAME_LENGTH: 20,
  MAX_EMAIL_LENGTH: 254,
  MAX_TEXTAREA_LENGTH: 5000,
} as const;

/**
 * Date format constants
 */
export const DATE_FORMATS = {
  SHORT: 'MMM D, YYYY',
  LONG: 'MMMM D, YYYY',
  TIME: 'h:mmA',
  DATETIME: 'MMM D, YYYY h:mmA',
  ISO: 'YYYY-MM-DDTHH:mm:ss.SSSZ',
} as const;

/**
 * Currency constants
 */
export const CURRENCY = {
  DEFAULT: 'USD',
  SYMBOL: '$',
  DECIMAL_PLACES: 2,
} as const;

/**
 * Social media constants
 */
export const SOCIAL = {
  INSTAGRAM: 'https://instagram.com/gvteway',
  TWITTER: 'https://twitter.com/gvteway',
  FACEBOOK: 'https://facebook.com/gvteway',
} as const;

/**
 * SEO constants
 */
export const SEO = {
  DEFAULT_TITLE: 'GVTEWAY',
  TITLE_TEMPLATE: '%s | GVTEWAY',
  DEFAULT_DESCRIPTION: 'Contemporary Minimal Pop Art Entertainment Platform',
  DEFAULT_IMAGE: '/og-image.png',
  SITE_NAME: 'GVTEWAY',
} as const;

/**
 * Feature flags
 */
export const FEATURES = {
  ENABLE_PWA: true,
  ENABLE_ANALYTICS: true,
  ENABLE_NOTIFICATIONS: true,
  ENABLE_REALTIME: true,
  ENABLE_DARK_MODE: false, // GHXSTSHIP is monochromatic
} as const;

/**
 * Error messages
 */
export const ERROR_MESSAGES = {
  GENERIC: 'AN ERROR OCCURRED. PLEASE TRY AGAIN',
  NETWORK: 'NETWORK ERROR. PLEASE CHECK YOUR CONNECTION',
  AUTH: 'PLEASE LOG IN TO CONTINUE',
  PERMISSION: 'YOU DO NOT HAVE PERMISSION TO ACCESS THIS',
  NOT_FOUND: 'RESOURCE NOT FOUND',
  VALIDATION: 'PLEASE CHECK YOUR INPUT',
  RATE_LIMIT: 'TOO MANY REQUESTS. PLEASE TRY AGAIN LATER',
} as const;

/**
 * Success messages
 */
export const SUCCESS_MESSAGES = {
  SAVED: 'SAVED SUCCESSFULLY',
  DELETED: 'DELETED SUCCESSFULLY',
  UPDATED: 'UPDATED SUCCESSFULLY',
  CREATED: 'CREATED SUCCESSFULLY',
  SENT: 'SENT SUCCESSFULLY',
} as const;

/**
 * Loading messages
 */
export const LOADING_MESSAGES = {
  DEFAULT: 'LOADING...',
  SAVING: 'SAVING...',
  DELETING: 'DELETING...',
  UPDATING: 'UPDATING...',
  CREATING: 'CREATING...',
  SENDING: 'SENDING...',
} as const;

/**
 * Regex patterns
 */
export const PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  URL: /^https?:\/\/.+/,
  PHONE: /^\+?[\d\s-()]+$/,
  USERNAME: /^[a-zA-Z0-9_-]+$/,
  SLUG: /^[a-z0-9-]+$/,
} as const;

/**
 * Keyboard keys
 */
export const KEYS = {
  ENTER: 'Enter',
  ESCAPE: 'Escape',
  SPACE: ' ',
  TAB: 'Tab',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  HOME: 'Home',
  END: 'End',
} as const;

/**
 * HTTP status codes
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  RATE_LIMIT: 429,
  SERVER_ERROR: 500,
} as const;

/**
 * Local storage keys
 */
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER: 'user',
  CART: 'cart',
  PREFERENCES: 'preferences',
  THEME: 'theme',
  LANGUAGE: 'language',
} as const;

/**
 * Event types
 */
export const EVENT_TYPES = {
  CONCERT: 'concert',
  FESTIVAL: 'festival',
  CLUB_NIGHT: 'club_night',
  UNDERGROUND: 'underground',
  WAREHOUSE: 'warehouse',
} as const;

/**
 * Ticket types
 */
export const TICKET_TYPES = {
  GENERAL_ADMISSION: 'general_admission',
  VIP: 'vip',
  EARLY_BIRD: 'early_bird',
  GROUP: 'group',
  STUDENT: 'student',
} as const;

/**
 * User roles
 */
export const USER_ROLES = {
  USER: 'user',
  ARTIST: 'artist',
  ORGANIZER: 'organizer',
  ADMIN: 'admin',
} as const;
