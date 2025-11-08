/**
 * Library Barrel Exports
 * Centralized exports for cleaner imports across the application
 */

// Utilities
export { cn } from './utils'

// Supabase
export { createClient as createSupabaseClient } from './supabase/client'
export { createClient as createSupabaseServerClient } from './supabase/server'

// API Utilities
export { handleAPIError, asyncHandler } from './api/error-handler'
export { requireAuth, parsePagination, parseSort, parseFilters } from './api/middleware'
export { rateLimit, RateLimitPresets } from './api/rate-limiter'

// Validations
export * from './validations/schemas'

// Services
export { EventService } from './services/event.service'
export { OrderService } from './services/order.service'
export { NotificationService } from './services/notification.service'
export { UploadService } from './services/upload.service'

// Security
export * from './security/sanitize'
export * from './security/headers'
export * from './security/csrf'
export { verifyUserOwnership, verifyBrandAccess, getUserBrandId, canAccessEvent, canAccessOrder, canAccessTicket, sanitizeInput, sanitizeSlug, isValidUUID, isValidEmail, isValidUrl, getClientIdentifier, logSecurityEvent } from './security/rls-helpers'

// Monitoring
export * from './monitoring/logger'

// Store
export { useCart, type CartItem } from './store/cart-store'

// Stripe
export * from './stripe/server'
export * from './stripe/client'

// Email
export * from './email/send'
export * from './email/templates'
export * from './email/email-tokens'

// Tickets
export * from './tickets/pdf-generator'
export * from './tickets/qr-generator'

// Analytics
export * from './analytics/events'

// Integrations
export * from './integrations/atlvs'

// i18n
export * from './i18n/config'
export * from './i18n/formatters'

// Accessibility
export * from './accessibility/a11y'

// Privacy
export * from './privacy/privacy-manager'

// Performance
export * from './performance/optimization'

// Cache
export * from './cache/redis'
