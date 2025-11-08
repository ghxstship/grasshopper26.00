import { z } from 'zod';

// ============================================================================
// AUTHENTICATION SCHEMAS
// ============================================================================

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  confirmPassword: z.string(),
  displayName: z.string().min(2, 'Display name must be at least 2 characters').optional(),
  referralCode: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export const resetPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

// ============================================================================
// EVENT SCHEMAS
// ============================================================================

export const createEventSchema = z.object({
  brandId: z.string().uuid('Invalid brand ID'),
  name: z.string().min(3, 'Event name must be at least 3 characters').max(200),
  slug: z.string().regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  description: z.string().min(10, 'Description must be at least 10 characters').optional(),
  eventType: z.enum(['festival', 'concert', 'club_night', 'conference', 'workshop', 'other']),
  startDate: z.string().datetime('Invalid start date'),
  endDate: z.string().datetime('Invalid end date').optional(),
  venueName: z.string().min(2, 'Venue name must be at least 2 characters').optional(),
  venueAddress: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zip: z.string().optional(),
    country: z.string().optional(),
  }).optional(),
  ageRestriction: z.enum(['all_ages', '18+', '21+']).optional(),
  capacity: z.number().int().positive('Capacity must be positive').optional(),
  status: z.enum(['draft', 'upcoming', 'on_sale', 'sold_out', 'cancelled', 'past']).default('draft'),
  heroImageUrl: z.string().url('Invalid image URL').optional(),
  heroVideoUrl: z.string().url('Invalid video URL').optional(),
  metadata: z.record(z.any()).optional(),
}).refine((data) => {
  if (data.endDate) {
    return new Date(data.startDate) < new Date(data.endDate);
  }
  return true;
}, {
  message: 'End date must be after start date',
  path: ['endDate'],
});

export const updateEventSchema = z.object({
  name: z.string().min(3, 'Event name must be at least 3 characters').max(200).optional(),
  slug: z.string().regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens').optional(),
  description: z.string().min(10, 'Description must be at least 10 characters').optional(),
  eventType: z.enum(['festival', 'concert', 'club_night', 'conference', 'workshop', 'other']).optional(),
  startDate: z.string().datetime('Invalid start date').optional(),
  endDate: z.string().datetime('Invalid end date').optional(),
  venueName: z.string().min(2, 'Venue name must be at least 2 characters').optional(),
  venueAddress: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zip: z.string().optional(),
    country: z.string().optional(),
  }).optional(),
  ageRestriction: z.enum(['all_ages', '18+', '21+']).optional(),
  capacity: z.number().int().positive('Capacity must be positive').optional(),
  status: z.enum(['draft', 'upcoming', 'on_sale', 'sold_out', 'cancelled', 'past']).optional(),
  heroImageUrl: z.string().url('Invalid image URL').optional(),
  heroVideoUrl: z.string().url('Invalid video URL').optional(),
  metadata: z.record(z.any()).optional(),
});

export const eventQuerySchema = z.object({
  status: z.enum(['draft', 'upcoming', 'on_sale', 'sold_out', 'cancelled', 'past']).optional(),
  eventType: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  search: z.string().optional(),
  limit: z.coerce.number().int().positive().max(100).default(20),
  offset: z.coerce.number().int().nonnegative().default(0),
  sortBy: z.enum(['start_date', 'created_at', 'name']).default('start_date'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

// Alias for consistency
export const queryEventsSchema = eventQuerySchema;

// ============================================================================
// ARTIST SCHEMAS
// ============================================================================

export const createArtistSchema = z.object({
  name: z.string().min(2, 'Artist name must be at least 2 characters').max(200),
  slug: z.string().regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  bio: z.string().min(10, 'Bio must be at least 10 characters').optional(),
  genreTags: z.array(z.string()).min(1, 'At least one genre is required').max(10),
  profileImageUrl: z.string().url('Invalid image URL').optional(),
  coverImageUrl: z.string().url('Invalid image URL').optional(),
  socialLinks: z.object({
    instagram: z.string().url().optional(),
    twitter: z.string().url().optional(),
    facebook: z.string().url().optional(),
    spotify: z.string().url().optional(),
    soundcloud: z.string().url().optional(),
    youtube: z.string().url().optional(),
  }).optional(),
  bookingEmail: z.string().email('Invalid email').optional(),
  websiteUrl: z.string().url('Invalid website URL').optional(),
  verified: z.boolean().default(false),
});

export const updateArtistSchema = createArtistSchema.partial();

export const artistQuerySchema = z.object({
  search: z.string().optional(),
  genre: z.string().optional(),
  verified: z.coerce.boolean().optional(),
  limit: z.coerce.number().int().positive().max(100).default(20),
  offset: z.coerce.number().int().nonnegative().default(0),
  sortBy: z.enum(['name', 'created_at']).default('name'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

// ============================================================================
// TICKET TYPE SCHEMAS
// ============================================================================

export const createTicketTypeSchema = z.object({
  eventId: z.string().uuid('Invalid event ID'),
  name: z.string().min(2, 'Ticket name must be at least 2 characters').max(100),
  description: z.string().optional(),
  price: z.number().nonnegative('Price must be non-negative'),
  quantityAvailable: z.number().int().positive('Quantity must be positive').optional(),
  saleStartDate: z.string().datetime('Invalid start date').optional(),
  saleEndDate: z.string().datetime('Invalid end date').optional(),
  maxPerOrder: z.number().int().positive('Max per order must be positive').optional(),
  perks: z.array(z.string()).optional(),
}).refine((data) => {
  if (data.saleStartDate && data.saleEndDate) {
    return new Date(data.saleStartDate) < new Date(data.saleEndDate);
  }
  return true;
}, {
  message: 'Sale end date must be after sale start date',
  path: ['saleEndDate'],
});

export const updateTicketTypeSchema = z.object({
  name: z.string().min(2, 'Ticket name must be at least 2 characters').max(100).optional(),
  description: z.string().optional(),
  price: z.number().nonnegative('Price must be non-negative').optional(),
  quantityAvailable: z.number().int().positive('Quantity must be positive').optional(),
  saleStartDate: z.string().datetime('Invalid start date').optional(),
  saleEndDate: z.string().datetime('Invalid end date').optional(),
  maxPerOrder: z.number().int().positive('Max per order must be positive').optional(),
  perks: z.array(z.string()).optional(),
});

// ============================================================================
// ORDER SCHEMAS
// ============================================================================

export const createOrderSchema = z.object({
  eventId: z.string().uuid('Invalid event ID'),
  items: z.array(z.object({
    ticketTypeId: z.string().uuid('Invalid ticket type ID'),
    quantity: z.number().int().positive('Quantity must be positive').max(20, 'Maximum 20 tickets per type'),
    attendees: z.array(z.object({
      name: z.string().min(2, 'Attendee name must be at least 2 characters'),
      email: z.string().email('Invalid email address'),
    })).optional(),
  })).min(1, 'At least one item is required'),
  billingDetails: z.object({
    name: z.string().min(2, 'Name is required'),
    email: z.string().email('Invalid email'),
    phone: z.string().optional(),
    address: z.object({
      line1: z.string().min(1, 'Address is required'),
      line2: z.string().optional(),
      city: z.string().min(1, 'City is required'),
      state: z.string().optional(),
      postal_code: z.string().min(1, 'Postal code is required'),
      country: z.string().min(2, 'Country is required'),
    }),
  }),
  metadata: z.record(z.any()).optional(),
});

export const orderQuerySchema = z.object({
  status: z.enum(['pending', 'processing', 'completed', 'cancelled', 'refunded']).optional(),
  eventId: z.string().uuid().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  limit: z.coerce.number().int().positive().max(100).default(20),
  offset: z.coerce.number().int().nonnegative().default(0),
  sortBy: z.enum(['created_at', 'total_amount']).default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// ============================================================================
// PRODUCT SCHEMAS
// ============================================================================

export const createProductSchema = z.object({
  brandId: z.string().uuid('Invalid brand ID'),
  eventId: z.string().uuid('Invalid event ID').optional(),
  name: z.string().min(2, 'Product name must be at least 2 characters').max(200),
  slug: z.string().regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  description: z.string().min(10, 'Description must be at least 10 characters').optional(),
  category: z.enum(['apparel', 'accessories', 'collectibles', 'digital', 'other']),
  basePrice: z.number().nonnegative('Price must be non-negative'),
  images: z.array(z.string().url('Invalid image URL')).min(1, 'At least one image is required'),
  status: z.enum(['draft', 'active', 'archived']).default('draft'),
  variants: z.array(z.object({
    name: z.string().min(1, 'Variant name is required'),
    sku: z.string().min(1, 'SKU is required'),
    price: z.number().nonnegative('Price must be non-negative').optional(),
    stockQuantity: z.number().int().nonnegative('Stock must be non-negative').optional(),
    attributes: z.record(z.string()).optional(),
  })).optional(),
  metadata: z.record(z.any()).optional(),
});

export const updateProductSchema = createProductSchema.partial().omit({ brandId: true });

export const productQuerySchema = z.object({
  category: z.string().optional(),
  status: z.enum(['draft', 'active', 'archived']).optional(),
  eventId: z.string().uuid().optional(),
  search: z.string().optional(),
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().nonnegative().optional(),
  limit: z.coerce.number().int().positive().max(100).default(20),
  offset: z.coerce.number().int().nonnegative().default(0),
  sortBy: z.enum(['name', 'base_price', 'created_at']).default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// ============================================================================
// USER PROFILE SCHEMAS
// ============================================================================

export const updateProfileSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters').max(30).regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores').optional(),
  displayName: z.string().min(2, 'Display name must be at least 2 characters').max(100).optional(),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  avatarUrl: z.string().url('Invalid image URL').optional(),
  favoriteGenres: z.array(z.string()).max(10, 'Maximum 10 genres').optional(),
  notificationPreferences: z.object({
    emailEnabled: z.boolean().optional(),
    pushEnabled: z.boolean().optional(),
    smsEnabled: z.boolean().optional(),
    orderConfirmation: z.boolean().optional(),
    eventReminder: z.boolean().optional(),
    eventUpdate: z.boolean().optional(),
    marketing: z.boolean().optional(),
  }).optional(),
});

// ============================================================================
// CONTENT POST SCHEMAS
// ============================================================================

export const createContentPostSchema = z.object({
  brandId: z.string().uuid('Invalid brand ID'),
  title: z.string().min(5, 'Title must be at least 5 characters').max(200),
  slug: z.string().regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  content: z.string().min(50, 'Content must be at least 50 characters'),
  excerpt: z.string().max(300, 'Excerpt must be less than 300 characters').optional(),
  postType: z.enum(['article', 'news', 'press_release', 'guide']).default('article'),
  featuredImageUrl: z.string().url('Invalid image URL').optional(),
  tags: z.array(z.string()).max(10, 'Maximum 10 tags').optional(),
  relatedEventId: z.string().uuid('Invalid event ID').optional(),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
  seoMetadata: z.object({
    metaTitle: z.string().max(60).optional(),
    metaDescription: z.string().max(160).optional(),
    keywords: z.array(z.string()).optional(),
  }).optional(),
});

export const updateContentPostSchema = createContentPostSchema.partial().omit({ brandId: true });

// ============================================================================
// SEARCH SCHEMAS
// ============================================================================

export const searchSchema = z.object({
  query: z.string().min(1, 'Search query is required').max(200),
  type: z.enum(['all', 'events', 'artists', 'products', 'content']).default('all'),
  limit: z.coerce.number().int().positive().max(50).default(20),
});

// ============================================================================
// WAITLIST SCHEMAS
// ============================================================================

export const joinWaitlistSchema = z.object({
  eventId: z.string().uuid('Invalid event ID'),
  ticketTypeId: z.string().uuid('Invalid ticket type ID'),
  quantity: z.number().int().positive('Quantity must be positive').max(10, 'Maximum 10 tickets'),
});

// ============================================================================
// LOYALTY SCHEMAS
// ============================================================================

export const redeemRewardSchema = z.object({
  rewardId: z.string().uuid('Invalid reward ID'),
});

export const applyReferralCodeSchema = z.object({
  code: z.string().min(1, 'Referral code is required').max(20),
});

// ============================================================================
// BULK OPERATION SCHEMAS
// ============================================================================

export const bulkDeleteSchema = z.object({
  ids: z.array(z.string().uuid('Invalid ID')).min(1, 'At least one ID is required').max(100, 'Maximum 100 items'),
});

export const bulkUpdateStatusSchema = z.object({
  ids: z.array(z.string().uuid('Invalid ID')).min(1, 'At least one ID is required').max(100, 'Maximum 100 items'),
  status: z.string().min(1, 'Status is required'),
});

// ============================================================================
// UPLOAD SCHEMAS
// ============================================================================

export const uploadSchema = z.object({
  file: z.instanceof(File),
  type: z.enum(['image', 'video', 'document']),
  maxSize: z.number().optional(),
});

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
export type EventQueryInput = z.infer<typeof eventQuerySchema>;
export type CreateArtistInput = z.infer<typeof createArtistSchema>;
export type UpdateArtistInput = z.infer<typeof updateArtistSchema>;
export type ArtistQueryInput = z.infer<typeof artistQuerySchema>;
export type CreateTicketTypeInput = z.infer<typeof createTicketTypeSchema>;
export type UpdateTicketTypeInput = z.infer<typeof updateTicketTypeSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type OrderQueryInput = z.infer<typeof orderQuerySchema>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ProductQueryInput = z.infer<typeof productQuerySchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type CreateContentPostInput = z.infer<typeof createContentPostSchema>;
export type UpdateContentPostInput = z.infer<typeof updateContentPostSchema>;
export type SearchInput = z.infer<typeof searchSchema>;
export type JoinWaitlistInput = z.infer<typeof joinWaitlistSchema>;
export type RedeemRewardInput = z.infer<typeof redeemRewardSchema>;
export type ApplyReferralCodeInput = z.infer<typeof applyReferralCodeSchema>;
export type BulkDeleteInput = z.infer<typeof bulkDeleteSchema>;
export type BulkUpdateStatusInput = z.infer<typeof bulkUpdateStatusSchema>;
