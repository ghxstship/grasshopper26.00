# Zero-Tolerance Completion Plan

## Executive Summary

This document outlines the complete implementation plan to achieve 100% atomic-level completion of all workflows for the Grasshopper 26.00 platform.

**Current Status**: 35% Complete  
**Target**: 100% Complete  
**Timeline**: 6-8 Weeks  
**Approach**: Phased implementation prioritizing critical user workflows

---

## Phase 1: Critical Purchase Flow (Week 1-2)
**Goal**: Enable end-to-end ticket and merchandise purchasing

### 1.1 Shopping Cart System
**Files to Create:**
- `/src/lib/store/cart-store.ts` - Zustand cart state
- `/src/components/features/cart-button.tsx` - Cart icon with count
- `/src/components/features/cart-drawer.tsx` - Sliding cart panel
- `/src/components/features/cart-item.tsx` - Individual cart item
- `/src/app/cart/page.tsx` - Full cart page

**Implementation:**
```typescript
// cart-store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartItem {
  id: string;
  type: 'ticket' | 'product';
  name: string;
  price: number;
  quantity: number;
  variant?: any;
  eventId?: string;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  total: () => number;
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => set((state) => ({
        items: [...state.items, item]
      })),
      removeItem: (id) => set((state) => ({
        items: state.items.filter(i => i.id !== id)
      })),
      updateQuantity: (id, quantity) => set((state) => ({
        items: state.items.map(i => 
          i.id === id ? { ...i, quantity } : i
        )
      })),
      clearCart: () => set({ items: [] }),
      total: () => get().items.reduce(
        (sum, item) => sum + (item.price * item.quantity), 0
      ),
    }),
    { name: 'cart-storage' }
  )
);
```

### 1.2 Checkout Flow
**Files to Create:**
- `/src/app/checkout/page.tsx` - Checkout page
- `/src/components/features/checkout-form.tsx` - Checkout form
- `/src/components/features/billing-form.tsx` - Billing details
- `/src/components/features/shipping-form.tsx` - Shipping address
- `/src/components/features/payment-form.tsx` - Stripe payment
- `/src/app/checkout/success/page.tsx` - Order confirmation

**API Routes:**
- `/src/app/api/checkout/create-session/route.ts`
- `/src/app/api/checkout/confirm/route.ts`

### 1.3 Stripe Integration
**Files to Create:**
- `/src/lib/stripe/client.ts` - Stripe client setup
- `/src/lib/stripe/checkout.ts` - Checkout helpers
- `/src/components/features/stripe-payment-element.tsx`

**Implementation:**
```typescript
// Complete Stripe checkout session creation
export async function createCheckoutSession(items: CartItem[]) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: items.map(item => ({
      price_data: {
        currency: 'usd',
        product_data: { name: item.name },
        unit_amount: item.price * 100,
      },
      quantity: item.quantity,
    })),
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/cart`,
  });
  
  return session;
}
```

### 1.4 Ticket Generation
**Files to Create:**
- `/src/lib/tickets/qr-generator.ts` - QR code generation
- `/src/lib/tickets/pdf-generator.ts` - PDF ticket generation
- `/src/components/features/ticket-display.tsx` - Ticket component
- `/src/app/api/tickets/generate/route.ts`

**Dependencies to Add:**
```json
{
  "qrcode": "^1.5.3",
  "jspdf": "^2.5.1",
  "@react-pdf/renderer": "^3.1.0"
}
```

### 1.5 Email Delivery
**Files to Create:**
- `/src/lib/email/send.ts` - Resend integration
- `/src/lib/email/queue.ts` - Email queue
- `/src/app/api/email/send/route.ts`

**Implementation:**
```typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendOrderConfirmation(order: Order) {
  await resend.emails.send({
    from: 'orders@grasshopper.com',
    to: order.user_email,
    subject: `Order Confirmation - ${order.event_name}`,
    html: emailTemplates.orderConfirmation(order),
    attachments: [{
      filename: 'tickets.pdf',
      content: await generateTicketPDF(order),
    }],
  });
}
```

---

## Phase 2: Admin Essentials (Week 3-4)
**Goal**: Enable complete content management

### 2.1 Event Creation
**Files to Create:**
- `/src/app/admin/events/create/page.tsx`
- `/src/components/admin/event-form.tsx`
- `/src/components/admin/stage-manager.tsx`
- `/src/components/admin/lineup-builder.tsx`
- `/src/components/admin/ticket-type-creator.tsx`
- `/src/app/api/admin/events/route.ts`

### 2.2 Artist Management
**Files to Create:**
- `/src/app/admin/artists/page.tsx` - Artist list
- `/src/app/admin/artists/create/page.tsx`
- `/src/app/admin/artists/[id]/edit/page.tsx`
- `/src/components/admin/artist-form.tsx`
- `/src/components/admin/artist-table.tsx`
- `/src/app/api/admin/artists/route.ts`
- `/src/app/api/admin/artists/[id]/route.ts`

### 2.3 Product Management
**Files to Create:**
- `/src/app/admin/products/page.tsx`
- `/src/app/admin/products/create/page.tsx`
- `/src/components/admin/product-form.tsx`
- `/src/components/admin/variant-manager.tsx`
- `/src/components/admin/inventory-tracker.tsx`
- `/src/app/api/admin/products/route.ts`

### 2.4 Order Management
**Files to Create:**
- `/src/app/admin/orders/page.tsx`
- `/src/components/admin/orders-table.tsx`
- `/src/components/admin/order-detail-modal.tsx`
- `/src/components/admin/refund-processor.tsx`
- `/src/app/api/admin/orders/[id]/refund/route.ts`

### 2.5 Image Upload System
**Files to Create:**
- `/src/components/ui/image-upload.tsx`
- `/src/lib/supabase/storage.ts`
- `/src/app/api/upload/route.ts`

**Implementation:**
```typescript
// Supabase Storage integration
export async function uploadImage(file: File, bucket: string) {
  const supabase = createClient();
  const fileName = `${Date.now()}-${file.name}`;
  
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(fileName, file);
  
  if (error) throw error;
  
  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(fileName);
  
  return publicUrl;
}
```

---

## Phase 3: User Experience (Week 5-6)
**Goal**: Complete all user-facing features

### 3.1 Profile Management
**Files to Create:**
- `/src/components/features/avatar-upload.tsx`
- `/src/components/features/password-change-form.tsx`
- `/src/components/features/email-change-form.tsx`
- `/src/components/features/notification-preferences.tsx`
- `/src/components/features/account-deletion.tsx`
- `/src/app/api/users/change-password/route.ts`
- `/src/app/api/users/change-email/route.ts`
- `/src/app/api/users/delete-account/route.ts`

### 3.2 Favorites System
**Files to Create:**
- `/src/components/features/follow-button.tsx`
- `/src/app/api/favorites/route.ts`
- `/src/app/api/favorites/[artistId]/route.ts`

**Database:**
```sql
-- Add trigger for favorite notifications
CREATE OR REPLACE FUNCTION notify_new_event()
RETURNS TRIGGER AS $$
BEGIN
  -- Notify users who follow artists in this event
  INSERT INTO notifications (user_id, type, message, related_event_id)
  SELECT DISTINCT ufa.user_id, 'new_event', 
    'New event featuring ' || a.name, NEW.id
  FROM user_favorite_artists ufa
  JOIN event_artists ea ON ea.artist_id = ufa.artist_id
  JOIN artists a ON a.id = ufa.artist_id
  WHERE ea.event_id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER event_created_notification
AFTER INSERT ON events
FOR EACH ROW
EXECUTE FUNCTION notify_new_event();
```

### 3.3 Schedule Builder
**Files to Create:**
- `/src/app/events/[slug]/schedule/page.tsx`
- `/src/components/features/timetable.tsx`
- `/src/components/features/schedule-builder.tsx`
- `/src/components/features/schedule-item.tsx`
- `/src/lib/schedule/ical-export.ts`
- `/src/app/api/schedule/route.ts`

### 3.4 Advanced Filters
**Files to Create:**
- `/src/components/features/event-filters.tsx`
- `/src/components/features/artist-filters.tsx`
- `/src/components/features/product-filters.tsx`
- `/src/components/ui/date-range-picker.tsx`
- `/src/components/ui/price-range-slider.tsx`
- `/src/lib/filters/query-builder.ts`

### 3.5 Pagination
**Files to Create:**
- `/src/components/ui/pagination.tsx`
- `/src/hooks/use-pagination.ts`
- `/src/lib/pagination/helpers.ts`

---

## Phase 4: Polish & Integration (Week 7-8)
**Goal**: Production-ready platform

### 4.1 Email System Completion
**Tasks:**
- ✅ Integrate Resend API
- ✅ Set up email verification
- ✅ Implement email queue
- ✅ Add retry logic
- ✅ Create all email templates
- ✅ Test email delivery

### 4.2 Analytics Enhancement
**Files to Create:**
- `/src/components/admin/analytics-charts.tsx`
- `/src/components/admin/conversion-funnel.tsx`
- `/src/components/admin/demographics-chart.tsx`
- `/src/lib/analytics/queries.ts`
- `/src/app/api/analytics/route.ts`

**Dependencies:**
```json
{
  "recharts": "^2.10.0",
  "date-fns": "^3.2.0"
}
```

### 4.3 Content Management
**Files to Create:**
- `/src/app/admin/content/page.tsx`
- `/src/app/admin/content/create/page.tsx`
- `/src/components/admin/rich-text-editor.tsx`
- `/src/components/admin/media-library.tsx`
- `/src/app/blog/page.tsx`
- `/src/app/blog/[slug]/page.tsx`

**Dependencies:**
```json
{
  "@tiptap/react": "^2.1.0",
  "@tiptap/starter-kit": "^2.1.0"
}
```

### 4.4 Testing
**Files to Create:**
- `/tests/e2e/purchase-flow.spec.ts`
- `/tests/e2e/admin-workflow.spec.ts`
- `/tests/unit/cart.test.ts`
- `/tests/unit/checkout.test.ts`

**Dependencies:**
```json
{
  "@playwright/test": "^1.40.0",
  "vitest": "^1.0.0",
  "@testing-library/react": "^14.0.0"
}
```

### 4.5 Documentation
**Files to Create:**
- `/docs/API.md` - API documentation
- `/docs/ADMIN_GUIDE.md` - Admin user guide
- `/docs/USER_GUIDE.md` - End user guide
- `/docs/DEVELOPER_GUIDE.md` - Developer documentation

---

## Additional Critical Components

### Notification System
**Files to Create:**
- `/src/lib/notifications/push.ts`
- `/src/lib/notifications/email.ts`
- `/src/lib/notifications/in-app.ts`
- `/src/components/features/notification-center.tsx`
- `/src/app/api/notifications/route.ts`

### Wallet Integration
**Files to Create:**
- `/src/lib/wallet/apple-wallet.ts`
- `/src/lib/wallet/google-wallet.ts`
- `/src/app/api/wallet/apple/route.ts`
- `/src/app/api/wallet/google/route.ts`

### Product Detail Pages
**Files to Create:**
- `/src/app/shop/[slug]/page.tsx`
- `/src/components/features/product-gallery.tsx`
- `/src/components/features/variant-selector.tsx`
- `/src/components/features/size-guide.tsx`

### Event Filters & Pagination
**Files to Create:**
- Update `/src/app/events/page.tsx` with filters
- Add pagination component
- Implement sort functionality

### Artist Listing Page
**Files to Create:**
- Update `/src/app/artists/page.tsx` with grid
- Add genre filters
- Add alphabetical sort
- Implement pagination

---

## Database Enhancements

### Triggers & Functions
```sql
-- Auto-update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables
CREATE TRIGGER update_events_updated_at
BEFORE UPDATE ON events
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Repeat for all tables...

-- Inventory management
CREATE OR REPLACE FUNCTION check_ticket_availability()
RETURNS TRIGGER AS $$
BEGIN
  IF (SELECT quantity_available - quantity_sold 
      FROM ticket_types 
      WHERE id = NEW.ticket_type_id) < NEW.quantity THEN
    RAISE EXCEPTION 'Not enough tickets available';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_ticket_purchase
BEFORE INSERT ON tickets
FOR EACH ROW
EXECUTE FUNCTION check_ticket_availability();
```

### Indexes
```sql
-- Performance indexes
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_brand_id ON events(brand_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_tickets_qr_code ON tickets(qr_code);
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_user_profiles_username ON user_profiles(username);

-- Full-text search
CREATE INDEX idx_events_search ON events USING gin(to_tsvector('english', name || ' ' || description));
CREATE INDEX idx_artists_search ON artists USING gin(to_tsvector('english', name || ' ' || bio));
```

### Views
```sql
-- Analytics views
CREATE VIEW event_sales_summary AS
SELECT 
  e.id,
  e.name,
  COUNT(DISTINCT o.id) as total_orders,
  COUNT(t.id) as tickets_sold,
  SUM(o.total_amount) as total_revenue
FROM events e
LEFT JOIN orders o ON o.event_id = e.id
LEFT JOIN tickets t ON t.order_id = o.id
GROUP BY e.id, e.name;

CREATE VIEW popular_artists AS
SELECT 
  a.id,
  a.name,
  COUNT(DISTINCT ufa.user_id) as follower_count,
  COUNT(DISTINCT ea.event_id) as event_count
FROM artists a
LEFT JOIN user_favorite_artists ufa ON ufa.artist_id = a.id
LEFT JOIN event_artists ea ON ea.artist_id = a.id
GROUP BY a.id, a.name
ORDER BY follower_count DESC;
```

---

## API Enhancements

### Pagination Support
```typescript
// Add to all list endpoints
interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const offset = (page - 1) * limit;
  
  const { data, count } = await supabase
    .from('events')
    .select('*', { count: 'exact' })
    .range(offset, offset + limit - 1);
  
  return NextResponse.json({
    data,
    pagination: {
      page,
      limit,
      total: count,
      totalPages: Math.ceil(count! / limit),
    },
  });
}
```

### Rate Limiting
```typescript
// Add to middleware
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'),
});

export async function middleware(request: NextRequest) {
  const ip = request.ip ?? '127.0.0.1';
  const { success } = await ratelimit.limit(ip);
  
  if (!success) {
    return new Response('Too Many Requests', { status: 429 });
  }
  
  return NextResponse.next();
}
```

---

## Testing Strategy

### Unit Tests
- Cart operations
- Checkout calculations
- Ticket generation
- Email formatting
- Filter logic

### Integration Tests
- API endpoints
- Database operations
- Stripe integration
- Email delivery
- File uploads

### E2E Tests
- Complete purchase flow
- Admin event creation
- User registration
- Profile management
- Search functionality

---

## Deployment Checklist

### Pre-Deployment
- [ ] All tests passing
- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] Stripe webhooks configured
- [ ] Email templates tested
- [ ] Image storage configured
- [ ] Analytics configured
- [ ] Error tracking configured

### Post-Deployment
- [ ] Smoke tests passed
- [ ] Payment flow verified
- [ ] Email delivery confirmed
- [ ] Admin access verified
- [ ] Performance metrics acceptable
- [ ] Security scan passed

---

## Success Metrics

### Technical
- 100% test coverage on critical paths
- < 2s page load time
- 99.9% API uptime
- < 100ms database query time
- Zero security vulnerabilities

### Business
- Successful ticket purchase flow
- Admin can create events
- Users can manage profiles
- Orders processed correctly
- Emails delivered reliably

---

## Timeline Summary

| Phase | Duration | Completion |
|-------|----------|------------|
| Phase 1: Critical Purchase Flow | 2 weeks | 0% → 60% |
| Phase 2: Admin Essentials | 2 weeks | 60% → 80% |
| Phase 3: User Experience | 2 weeks | 80% → 95% |
| Phase 4: Polish & Integration | 2 weeks | 95% → 100% |
| **TOTAL** | **8 weeks** | **100%** |

---

## Immediate Next Steps

1. **Week 1 Day 1-2**: Shopping cart system
2. **Week 1 Day 3-4**: Checkout flow
3. **Week 1 Day 5**: Stripe integration
4. **Week 2 Day 1-2**: Ticket generation
5. **Week 2 Day 3-4**: Email delivery
6. **Week 2 Day 5**: Testing & bug fixes

---

**Plan Status**: READY FOR EXECUTION  
**Priority**: CRITICAL  
**Owner**: Development Team  
**Review Date**: Weekly progress reviews

This plan ensures zero-tolerance completion of all atomic-level workflows for every user type.
