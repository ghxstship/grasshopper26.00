# Grasshopper API Documentation
**Version:** 1.0.0  
**Base URL:** `https://api.grasshopper.com/v1`  
**Authentication:** Bearer Token (JWT)

---

## Table of Contents
1. [Authentication](#authentication)
2. [Events API](#events-api)
3. [Orders API](#orders-api)
4. [Search API](#search-api)
5. [Analytics API](#analytics-api)
6. [Notifications API](#notifications-api)
7. [Error Handling](#error-handling)
8. [Rate Limiting](#rate-limiting)

---

## Authentication

All API requests require authentication using a Bearer token in the Authorization header.

```http
Authorization: Bearer <your_token_here>
```

### Get Access Token

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "...",
  "expires_in": 3600
}
```

---

## Events API

### List Events

```http
GET /api/v1/events
```

**Query Parameters:**
- `status` (string): Filter by status (draft, published, cancelled)
- `brandId` (string): Filter by brand ID
- `startDate` (string): Filter events starting after this date
- `endDate` (string): Filter events ending before this date
- `limit` (number): Results per page (default: 20, max: 100)
- `offset` (number): Pagination offset
- `sortBy` (string): Sort field (start_date, created_at, name)
- `sortOrder` (string): Sort order (asc, desc)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Summer Music Festival",
      "slug": "summer-music-festival",
      "description": "...",
      "event_type": "festival",
      "start_date": "2025-07-15T18:00:00Z",
      "end_date": "2025-07-17T23:00:00Z",
      "venue_name": "Central Park",
      "status": "published",
      "hero_image_url": "https://...",
      "event_artists": [...],
      "ticket_types": [...]
    }
  ],
  "pagination": {
    "total": 150,
    "limit": 20,
    "offset": 0,
    "page": 1,
    "totalPages": 8
  }
}
```

### Get Event by ID

```http
GET /api/v1/events/{id}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Summer Music Festival",
    "event_artists": [
      {
        "artist_id": "uuid",
        "artists": {
          "id": "uuid",
          "name": "Artist Name",
          "profile_image_url": "https://...",
          "genre_tags": ["rock", "indie"]
        }
      }
    ],
    "ticket_types": [
      {
        "id": "uuid",
        "name": "General Admission",
        "price": "75.00",
        "quantity_available": 1000,
        "quantity_sold": 450
      }
    ]
  }
}
```

### Create Event

```http
POST /api/v1/events
Authorization: Bearer <token>
Content-Type: application/json

{
  "brandId": "uuid",
  "name": "New Event",
  "slug": "new-event",
  "eventType": "concert",
  "startDate": "2025-08-01T19:00:00Z",
  "venueName": "Madison Square Garden",
  "status": "draft"
}
```

**Response:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Event created successfully"
}
```

### Update Event

```http
PATCH /api/v1/events/{id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Event Name",
  "status": "published"
}
```

### Delete Event

```http
DELETE /api/v1/events/{id}
Authorization: Bearer <token>
```

---

## Orders API

### Get Order by ID

```http
GET /api/v1/orders/{id}
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "event_id": "uuid",
    "status": "completed",
    "total_amount": "150.00",
    "created_at": "2025-06-01T10:00:00Z",
    "events": {
      "name": "Summer Music Festival",
      "start_date": "2025-07-15T18:00:00Z"
    },
    "tickets": [
      {
        "id": "uuid",
        "qr_code": "...",
        "status": "active",
        "ticket_types": {
          "name": "General Admission",
          "price": "75.00"
        }
      }
    ]
  }
}
```

### Update Order Status

```http
PATCH /api/v1/orders/{id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "cancelled"
}
```

### Cancel Order

```http
DELETE /api/v1/orders/{id}
Authorization: Bearer <token>
```

---

## Search API

### Universal Search

```http
GET /api/v1/search?q=concert&limit=20
```

**Query Parameters:**
- `q` (string, required): Search query (min 2 characters)
- `limit` (number): Max results (default: 20, max: 100)

**Response:**
```json
{
  "success": true,
  "query": "concert",
  "data": {
    "events": [
      {
        "id": "uuid",
        "name": "Rock Concert",
        "result_type": "event",
        "rank": 0.95
      }
    ],
    "artists": [...],
    "products": [...],
    "posts": [...]
  },
  "total": 45
}
```

---

## Analytics API

### Get Dashboard KPIs

```http
GET /api/v1/analytics/dashboard
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "kpis": {
      "total_revenue": 125000.50,
      "total_orders": 1250,
      "total_tickets_sold": 3500,
      "active_events": 15
    },
    "recentOrders": [...],
    "topEvents": [...],
    "topArtists": [...]
  }
}
```

---

## Notifications API

### Get User Notifications

```http
GET /api/v1/notifications?unreadOnly=true&limit=20
Authorization: Bearer <token>
```

**Query Parameters:**
- `unreadOnly` (boolean): Only return unread notifications
- `limit` (number): Results per page

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "type": "order_confirmation",
      "title": "Order Confirmed",
      "message": "Your order has been confirmed!",
      "read": false,
      "created_at": "2025-06-01T10:00:00Z",
      "data": {
        "orderId": "uuid"
      }
    }
  ],
  "total": 15,
  "unreadCount": 5
}
```

### Mark Notifications as Read

```http
PATCH /api/v1/notifications
Authorization: Bearer <token>
Content-Type: application/json

{
  "notificationIds": ["uuid1", "uuid2"]
}
```

Or mark all as read:

```json
{
  "markAllAsRead": true
}
```

---

## Error Handling

All errors follow a consistent format:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input provided",
    "details": {
      "field": "email",
      "issue": "Invalid email format"
    },
    "timestamp": "2025-06-01T10:00:00Z",
    "path": "/api/v1/events"
  }
}
```

### Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `UNAUTHORIZED` | 401 | Missing or invalid authentication |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 400 | Invalid input data |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INTERNAL_SERVER_ERROR` | 500 | Server error |
| `DATABASE_ERROR` | 500 | Database operation failed |

---

## Rate Limiting

API requests are rate limited based on endpoint type:

| Endpoint Type | Limit | Window |
|--------------|-------|--------|
| Authentication | 5 requests | 15 minutes |
| Read Operations | 100 requests | 1 minute |
| Write Operations | 30 requests | 1 minute |
| Search | 60 requests | 1 minute |

Rate limit headers are included in all responses:

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1625097600
```

When rate limited, you'll receive a 429 response:

```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Rate limit exceeded. Please try again later.",
    "details": {
      "retryAfter": 45
    }
  }
}
```

---

## Webhooks

### Stripe Webhooks

Endpoint: `POST /api/webhooks/stripe/enhanced`

Supported events:
- `payment_intent.succeeded`
- `payment_intent.payment_failed`
- `charge.refunded`
- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`

---

## SDK Examples

### JavaScript/TypeScript

```typescript
import { GrasshopperClient } from '@grasshopper/sdk';

const client = new GrasshopperClient({
  apiKey: 'your_api_key',
  baseUrl: 'https://api.grasshopper.com/v1'
});

// List events
const events = await client.events.list({
  status: 'published',
  limit: 20
});

// Get event
const event = await client.events.get('event_id');

// Create order
const order = await client.orders.create({
  eventId: 'event_id',
  ticketTypeId: 'ticket_type_id',
  quantity: 2
});
```

### cURL

```bash
# List events
curl -X GET "https://api.grasshopper.com/v1/events?status=published" \
  -H "Authorization: Bearer <token>"

# Create event
curl -X POST "https://api.grasshopper.com/v1/events" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Event",
    "eventType": "concert",
    "startDate": "2025-08-01T19:00:00Z"
  }'
```

---

## Support

For API support, contact:
- Email: api@grasshopper.com
- Documentation: https://docs.grasshopper.com
- Status Page: https://status.grasshopper.com
