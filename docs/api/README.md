# GVTEWAY API Documentation

## Overview

GVTEWAY provides a comprehensive REST API for managing live entertainment experiences, including events, tickets, memberships, and more.

**Base URL:** `https://gvteway.com/api/v1`

**API Version:** 2.0.0

## Quick Start

### Authentication

All authenticated endpoints require a JWT token in the Authorization header:

```bash
Authorization: Bearer <your-jwt-token>
```

Get your token by authenticating through the `/auth/login` endpoint.

### Rate Limits

- **Authenticated requests:** 1000 requests/hour
- **Unauthenticated requests:** 100 requests/hour
- **Write operations:** 100 requests/hour
- **Read operations:** 500 requests/hour

### Example Request

```bash
curl -X GET "https://gvteway.com/api/v1/events?page=1&limit=20" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Documentation

### OpenAPI Specification

The complete API specification is available in OpenAPI 3.0 format:

- **File:** `/public/api-docs/openapi.yaml`
- **Interactive Docs:** Available at `/api-docs` (when running locally)

### API Inventory

Generate an up-to-date inventory of all API endpoints:

```bash
npm run generate-api-docs
```

This will create `/docs/api/API_INVENTORY.md` with:
- Complete endpoint listing
- Documentation coverage statistics
- Categorized endpoints
- Undocumented endpoint warnings

## Key Features

### 1. Batch Operations

Process multiple operations in a single request for improved efficiency.

**Maximum batch size:** 100 items per request

#### Bulk Event Operations

```bash
POST /api/v1/batch/events
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN

{
  "operations": [
    {
      "action": "create",
      "data": {
        "name": "Summer Concert",
        "slug": "summer-concert-2025",
        "startDate": "2025-07-15T19:00:00Z"
      }
    },
    {
      "action": "update",
      "id": "event-uuid",
      "data": {
        "status": "on_sale"
      }
    }
  ]
}
```

#### Bulk Ticket Operations

```bash
POST /api/v1/batch/tickets
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN

{
  "operations": [
    {
      "action": "validate",
      "ticketId": "ticket-uuid-1"
    },
    {
      "action": "transfer",
      "ticketId": "ticket-uuid-2",
      "transferTo": "user-uuid"
    }
  ]
}
```

### 2. Pagination

All list endpoints support pagination:

```bash
GET /api/v1/events?page=1&limit=20
```

Response includes pagination metadata:

```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

### 3. Filtering & Sorting

Most endpoints support filtering and sorting:

```bash
GET /api/v1/events?status=on_sale&sortBy=start_date&sortOrder=asc
```

### 4. Error Handling

All errors follow a consistent format:

```json
{
  "error": "ValidationError",
  "message": "Invalid event data",
  "code": "VALIDATION_ERROR"
}
```

**HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Rate Limit Exceeded
- `500` - Internal Server Error

## API Categories

### Events
- `GET /events` - List events
- `POST /events` - Create event
- `GET /events/{id}` - Get event details
- `PATCH /events/{id}` - Update event
- `DELETE /events/{id}` - Delete event

### Artists
- `GET /artists` - List artists
- `GET /artists/{id}` - Get artist details

### Tickets
- `GET /tickets/{id}` - Get ticket details
- `GET /tickets/{id}/download` - Download ticket PDF

### Orders
- `GET /orders/{id}` - Get order details
- `POST /orders/{id}/refund` - Refund order

### Memberships
- `GET /memberships/tiers` - List membership tiers
- `POST /memberships/subscribe` - Subscribe to tier
- `GET /memberships/current` - Get current membership

### Checkout
- `POST /checkout/create-session` - Create checkout session
- `POST /checkout/confirm` - Confirm payment

### Admin
- `GET /admin/analytics` - Get analytics dashboard
- `GET /admin/events` - Manage events (admin)
- `POST /admin/events` - Create event (admin)

### Batch Operations
- `POST /batch/events` - Bulk event operations
- `POST /batch/tickets` - Bulk ticket operations

## Webhooks

Configure webhooks to receive real-time notifications for:
- Order completed
- Ticket purchased
- Event updated
- Membership subscribed

Webhook payloads include event type and relevant data.

## Best Practices

### 1. Use Batch Operations

For bulk operations, use batch endpoints instead of making multiple individual requests:

```javascript
// ❌ Bad - Multiple requests
for (const ticket of tickets) {
  await fetch(`/api/v1/tickets/${ticket.id}/validate`, { method: 'POST' });
}

// ✅ Good - Single batch request
await fetch('/api/v1/batch/tickets', {
  method: 'POST',
  body: JSON.stringify({
    operations: tickets.map(t => ({ action: 'validate', ticketId: t.id }))
  })
});
```

### 2. Handle Rate Limits

Implement exponential backoff when rate limited:

```javascript
async function apiRequest(url, options, retries = 3) {
  try {
    const response = await fetch(url, options);
    if (response.status === 429 && retries > 0) {
      const delay = Math.pow(2, 3 - retries) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
      return apiRequest(url, options, retries - 1);
    }
    return response;
  } catch (error) {
    throw error;
  }
}
```

### 3. Cache Responses

Cache GET requests when appropriate:

```javascript
const cache = new Map();

async function getCachedEvents() {
  const cacheKey = 'events';
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }
  
  const response = await fetch('/api/v1/events');
  const data = await response.json();
  cache.set(cacheKey, data);
  
  // Invalidate after 5 minutes
  setTimeout(() => cache.delete(cacheKey), 5 * 60 * 1000);
  
  return data;
}
```

### 4. Validate Input

Always validate input before making API requests:

```javascript
import { z } from 'zod';

const eventSchema = z.object({
  name: z.string().min(1).max(200),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  startDate: z.string().datetime(),
});

// Validate before sending
const validatedData = eventSchema.parse(eventData);
await fetch('/api/v1/events', {
  method: 'POST',
  body: JSON.stringify(validatedData),
});
```

## Support

For API support, contact: **support@gvteway.com**

## Changelog

### v2.0.0 (2025-01-09)
- ✅ Added batch operations endpoints
- ✅ Updated OpenAPI specification with comprehensive documentation
- ✅ Added GVTEWAY branding
- ✅ Enhanced error responses
- ✅ Added new schema definitions

### v1.0.0 (2024-12-01)
- Initial API release
- 47+ REST endpoints
- JWT authentication
- Rate limiting
- Webhook support
