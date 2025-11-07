# ATLVS (Dragonfly26.00) Integration Guide

## Overview

Grasshopper 26.00 seamlessly integrates with ATLVS (Dragonfly26.00) to provide a complete entertainment platform solution. While Grasshopper handles the customer-facing experience (events, tickets, artists, merchandise), ATLVS manages the production side (resources, staff, equipment, business operations).

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Customer Experience                       │
│                   (Grasshopper 26.00)                        │
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Events  │  │ Tickets  │  │ Artists  │  │   Shop   │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│                                                              │
│                    ▼ API Integration ▼                       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ REST API
                              │
┌─────────────────────────────────────────────────────────────┐
│                  Production Management                       │
│                    (ATLVS/Dragonfly)                        │
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │Production│  │ Network  │  │ Business │  │Analytics │   │
│  │   Hub    │  │   Hub    │  │   Hub    │  │   Hub    │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Integration Points

### 1. Event Synchronization

When an event is created or updated in Grasshopper, it automatically syncs to ATLVS for production planning.

**Grasshopper → ATLVS**
- Event details (name, dates, venue)
- Ticket sales data
- Capacity information
- Status updates

**ATLVS → Grasshopper**
- Resource availability
- Production status
- Staff assignments
- Equipment allocations

### 2. Resource Management

ATLVS provides resource data that Grasshopper can use for event planning.

```typescript
import { getATLVSResources } from '@/lib/integrations/atlvs'

// Get available resources for event date
const resources = await getATLVSResources('2025-06-15')

// Filter by type
const staff = resources.filter(r => r.type === 'staff')
const equipment = resources.filter(r => r.type === 'equipment')
const venues = resources.filter(r => r.type === 'venue')
```

### 3. Sales Analytics

Ticket sales data from Grasshopper flows to ATLVS for business intelligence.

```typescript
import { syncTicketSalesToATLVS } from '@/lib/integrations/atlvs'

// After successful ticket purchase
await syncTicketSalesToATLVS({
  eventId: event.id,
  ticketsSold: quantity,
  revenue: totalAmount,
  timestamp: new Date().toISOString(),
})
```

### 4. Cross-Platform Analytics

ATLVS provides comprehensive analytics that combine production and sales data.

```typescript
import { getATLVSAnalytics } from '@/lib/integrations/atlvs'

// Get analytics for an event
const analytics = await getATLVSAnalytics(eventId)

// Analytics include:
// - Ticket sales trends
// - Resource utilization
// - Budget vs actual
// - Attendance predictions
```

## API Endpoints

### ATLVS API Endpoints (consumed by Grasshopper)

```
POST   /api/production/events          # Create/update event
GET    /api/production/resources       # Get available resources
POST   /api/business/sales             # Sync sales data
GET    /api/intelligence/analytics     # Get analytics
```

### Grasshopper API Endpoints (consumed by ATLVS)

```
GET    /api/events                     # List events
GET    /api/events/:slug               # Get event details
GET    /api/orders                     # List orders
GET    /api/tickets                    # List tickets
```

## Data Flow Examples

### Event Creation Flow

1. **Grasshopper**: User creates event
2. **Grasshopper**: Event saved to Supabase
3. **Grasshopper**: Calls `syncEventToATLVS()`
4. **ATLVS**: Receives event data
5. **ATLVS**: Creates production project
6. **ATLVS**: Allocates initial resources
7. **ATLVS**: Returns production ID
8. **Grasshopper**: Stores production ID in metadata

### Ticket Purchase Flow

1. **Grasshopper**: User purchases tickets
2. **Grasshopper**: Stripe processes payment
3. **Grasshopper**: Order created in database
4. **Grasshopper**: Calls `syncTicketSalesToATLVS()`
5. **ATLVS**: Updates sales analytics
6. **ATLVS**: Adjusts resource allocations
7. **ATLVS**: Updates capacity planning

## Configuration

### Environment Variables

```env
# ATLVS Integration
ATLVS_API_URL=https://atlvs.yourdomain.com/api
ATLVS_API_KEY=your_secure_api_key
```

### API Authentication

All requests to ATLVS include an Authorization header:

```typescript
headers: {
  'Authorization': `Bearer ${ATLVS_API_KEY}`,
  'Content-Type': 'application/json',
}
```

## Error Handling

The integration includes comprehensive error handling:

```typescript
try {
  await syncEventToATLVS(event)
} catch (error) {
  console.error('ATLVS sync failed:', error)
  // Event still works in Grasshopper
  // Sync can be retried later
}
```

**Graceful Degradation**: If ATLVS is unavailable, Grasshopper continues to function. Integration operations are logged and can be retried.

## Webhooks

### ATLVS → Grasshopper Webhooks

ATLVS can send webhooks to Grasshopper for:
- Production status updates
- Resource allocation changes
- Budget alerts
- Staff assignments

**Webhook Endpoint**: `POST /api/webhooks/atlvs`

### Grasshopper → ATLVS Webhooks

Grasshopper sends webhooks to ATLVS for:
- New ticket sales
- Event updates
- Cancellations
- Refunds

## Best Practices

### 1. Async Operations

Run integration calls asynchronously to avoid blocking user operations:

```typescript
// Don't wait for ATLVS sync
syncEventToATLVS(event).catch(console.error)

// Return immediately to user
return { success: true, eventId: event.id }
```

### 2. Retry Logic

Implement retry logic for failed integrations:

```typescript
async function syncWithRetry(data: any, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await syncEventToATLVS(data)
    } catch (error) {
      if (i === maxRetries - 1) throw error
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)))
    }
  }
}
```

### 3. Data Validation

Validate data before sending to ATLVS:

```typescript
function validateEventData(event: any) {
  if (!event.id || !event.name || !event.start_date) {
    throw new Error('Invalid event data')
  }
  return true
}
```

## Monitoring

### Integration Health Check

```typescript
// Check ATLVS availability
async function checkATLVSHealth() {
  try {
    const response = await fetch(`${ATLVS_API_URL}/health`)
    return response.ok
  } catch {
    return false
  }
}
```

### Logging

All integration calls are logged:
- Request timestamp
- Endpoint called
- Response status
- Error details (if any)

## Security

### API Key Management

- Store API keys in environment variables
- Never commit keys to version control
- Rotate keys regularly
- Use different keys for development/production

### Data Privacy

- Only sync necessary data
- Respect user privacy settings
- Comply with GDPR/data regulations
- Encrypt sensitive data in transit

## Future Enhancements

Planned integration improvements:

1. **Real-time Sync**: WebSocket connection for instant updates
2. **Bi-directional Webhooks**: Two-way event notifications
3. **Shared User Authentication**: Single sign-on between platforms
4. **Embedded Analytics**: ATLVS analytics widgets in Grasshopper
5. **Resource Booking**: Direct resource booking from Grasshopper

## Support

For integration issues:
1. Check ATLVS API documentation
2. Verify API key and permissions
3. Review error logs
4. Test with ATLVS health check endpoint
5. Contact ATLVS support team

---

**Seamless integration for world-class entertainment experiences** 🎉
