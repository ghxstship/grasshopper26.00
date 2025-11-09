# 🚀 Remediation Implementation Guide - Grasshopper 26.00
**Date**: January 7, 2025  
**Status**: Implementation in Progress

---

## ✅ COMPLETED ITEMS

### Database Schema Enhancements ✅
**Status**: Migration file created  
**File**: `/supabase/migrations/20250107_missing_tables.sql`

**Added Tables**:
- ✅ `content_posts` - Blog/news CMS
- ✅ `media_gallery` - Photo/video library
- ✅ `user_event_schedules` - Personal schedule builder
- ✅ `brand_integrations` - Third-party integration configs
- ✅ `user_connections` - Friend system
- ✅ `user_messages` - Direct messaging
- ✅ `event_chat_rooms` - Event-based chat
- ✅ `event_chat_messages` - Chat messages
- ✅ `user_content` - User-generated content
- ✅ `push_subscriptions` - Push notification subscriptions
- ✅ `email_queue` - Email queue for Resend

**Next Steps**:
1. Run migration: `cd experience-platform && npm run db:migrate`
2. Update TypeScript types: Generate from Supabase CLI
3. Test all RLS policies

### Resend Email Integration ✅
**Status**: Already implemented  
**Files**:
- ✅ `/src/lib/email/resend-client.ts` - Resend client
- ✅ `/src/lib/email/send.ts` - Email sending functions
- ✅ `/src/lib/email/templates.ts` - Email templates
- ✅ `/src/app/api/webhooks/resend/route.ts` - Webhook handler

**Verified Features**:
- ✅ Order confirmation emails
- ✅ Ticket delivery emails
- ✅ Password reset emails
- ✅ Newsletter confirmation
- ✅ Waitlist notifications
- ✅ Event reminders
- ✅ Ticket transfer emails

**Next Steps**:
1. Add email queue processor (cron job or Edge Function)
2. Implement email analytics tracking
3. Add unsubscribe functionality

### PWA Foundation ✅
**Status**: Partially implemented  
**Files**:
- ✅ `/public/manifest.json` - PWA manifest exists
- ✅ `/public/sw.js` - Service worker exists (needs verification)

**Next Steps**:
1. Verify service worker functionality
2. Add offline caching strategy
3. Implement push notification handling
4. Add app install prompts
5. Test on mobile devices

---

## 🚧 IN PROGRESS

### 1. Push Notification System
**Priority**: P0 (Critical)  
**Estimated Time**: 4 hours

#### Implementation Steps:

**A. Create Push Notification Service**
```typescript
// File: /src/lib/notifications/push-service.ts

import { createClient } from '@/lib/supabase/server';

export async function subscribeToPushNotifications(
  userId: string,
  subscription: PushSubscription
) {
  const supabase = await createClient();
  
  await supabase.from('push_subscriptions').upsert({
    user_id: userId,
    endpoint: subscription.endpoint,
    keys: {
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
    },
    user_agent: navigator.userAgent,
  });
}

export async function sendPushNotification(
  userId: string,
  notification: {
    title: string;
    body: string;
    icon?: string;
    badge?: string;
    data?: any;
  }
) {
  const supabase = await createClient();
  
  const { data: subscriptions } = await supabase
    .from('push_subscriptions')
    .select('*')
    .eq('user_id', userId);
  
  if (!subscriptions) return;
  
  const webpush = require('web-push');
  
  webpush.setVapidDetails(
    'mailto:support@grasshopper.com',
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
  );
  
  const promises = subscriptions.map(sub => 
    webpush.sendNotification(
      {
        endpoint: sub.endpoint,
        keys: sub.keys,
      },
      JSON.stringify(notification)
    )
  );
  
  await Promise.allSettled(promises);
}
```

**B. Add Push Notification Hook**
```typescript
// File: /src/hooks/use-push-notifications.ts

'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';

export function usePushNotifications() {
  const { user } = useAuth();
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  
  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);
  
  const requestPermission = async () => {
    const result = await Notification.requestPermission();
    setPermission(result);
    
    if (result === 'granted' && user) {
      await subscribe();
    }
  };
  
  const subscribe = async () => {
    if (!('serviceWorker' in navigator) || !user) return;
    
    const registration = await navigator.serviceWorker.ready;
    const sub = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    });
    
    setSubscription(sub);
    
    // Save to database
    await fetch('/api/notifications/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sub),
    });
  };
  
  return { permission, subscription, requestPermission };
}
```

**C. Add API Endpoint**
```typescript
// File: /src/app/api/notifications/subscribe/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  const subscription = await req.json();
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  await supabase.from('push_subscriptions').upsert({
    user_id: user.id,
    endpoint: subscription.endpoint,
    keys: subscription.keys,
  });
  
  return NextResponse.json({ success: true });
}
```

**D. Environment Variables Needed**
```bash
# Add to .env.local
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key
```

**E. Generate VAPID Keys**
```bash
npx web-push generate-vapid-keys
```

---

### 2. Community Features - Messaging System
**Priority**: P0 (Critical)  
**Estimated Time**: 8 hours

#### Implementation Steps:

**A. Create Messaging Service**
```typescript
// File: /src/lib/services/messaging.service.ts

import { createClient } from '@/lib/supabase/server';
import { Database } from '@/types/database';

type Message = Database['public']['Tables']['user_messages']['Row'];
type MessageInsert = Database['public']['Tables']['user_messages']['Insert'];

export class MessagingService {
  private supabase: Awaited<ReturnType<typeof createClient>>;

  constructor(supabase: Awaited<ReturnType<typeof createClient>>) {
    this.supabase = supabase;
  }

  async sendMessage(data: MessageInsert): Promise<Message> {
    const { data: message, error } = await this.supabase
      .from('user_messages')
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return message;
  }

  async getConversation(userId: string, otherUserId: string) {
    const { data, error } = await this.supabase
      .from('user_messages')
      .select('*')
      .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
      .or(`sender_id.eq.${otherUserId},recipient_id.eq.${otherUserId}`)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
  }

  async markAsRead(userId: string, senderId: string) {
    await this.supabase.rpc('mark_messages_read', {
      p_user_id: userId,
      p_sender_id: senderId,
    });
  }

  async getUnreadCount(userId: string): Promise<number> {
    const { data, error } = await this.supabase.rpc('get_unread_message_count', {
      p_user_id: userId,
    });

    if (error) throw error;
    return data || 0;
  }
}
```

**B. Create Messaging API Endpoints**
```typescript
// File: /src/app/api/v1/messages/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { MessagingService } from '@/lib/services/messaging.service';

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const searchParams = req.nextUrl.searchParams;
  const otherUserId = searchParams.get('userId');
  
  if (!otherUserId) {
    return NextResponse.json({ error: 'userId required' }, { status: 400 });
  }
  
  const service = new MessagingService(supabase);
  const messages = await service.getConversation(user.id, otherUserId);
  
  return NextResponse.json({ messages });
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const body = await req.json();
  const service = new MessagingService(supabase);
  
  const message = await service.sendMessage({
    sender_id: user.id,
    recipient_id: body.recipientId,
    message: body.message,
    metadata: body.metadata,
  });
  
  // Send push notification to recipient
  // TODO: Implement push notification
  
  return NextResponse.json({ message });
}
```

**C. Create Messaging UI Component**
```typescript
// File: /src/components/features/messaging/message-thread.tsx

'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

export function MessageThread({ otherUserId }: { otherUserId: string }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  useEffect(() => {
    loadMessages();
    
    // Subscribe to real-time updates
    const channel = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'user_messages',
          filter: `recipient_id=eq.${user?.id}`,
        },
        (payload) => {
          setMessages(prev => [...prev, payload.new]);
          scrollToBottom();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [otherUserId]);

  const loadMessages = async () => {
    const res = await fetch(`/api/v1/messages?userId=${otherUserId}`);
    const data = await res.json();
    setMessages(data.messages);
    scrollToBottom();
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    
    setLoading(true);
    await fetch('/api/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recipientId: otherUserId,
        message: newMessage,
      }),
    });
    
    setNewMessage('');
    setLoading(false);
    await loadMessages();
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 p-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`mb-4 ${
              msg.sender_id === user?.id ? 'text-right' : 'text-left'
            }`}
          >
            <div
              className={`inline-block p-3 rounded-lg ${
                msg.sender_id === user?.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted'
              }`}
            >
              {msg.message}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {new Date(msg.created_at).toLocaleTimeString()}
            </div>
          </div>
        ))}
        <div ref={scrollRef} />
      </ScrollArea>
      
      <div className="p-4 border-t flex gap-2">
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Type a message..."
          disabled={loading}
        />
        <Button onClick={sendMessage} disabled={loading}>
          Send
        </Button>
      </div>
    </div>
  );
}
```

---

### 3. Event Chat Rooms
**Priority**: P0 (Critical)  
**Estimated Time**: 6 hours

#### Implementation Steps:

**A. Create Chat Service**
```typescript
// File: /src/lib/services/chat.service.ts

import { createClient } from '@/lib/supabase/server';
import { Database } from '@/types/database';

type ChatRoom = Database['public']['Tables']['event_chat_rooms']['Row'];
type ChatMessage = Database['public']['Tables']['event_chat_messages']['Row'];

export class ChatService {
  private supabase: Awaited<ReturnType<typeof createClient>>;

  constructor(supabase: Awaited<ReturnType<typeof createClient>>) {
    this.supabase = supabase;
  }

  async createRoom(eventId: string, name: string, roomType: string = 'public') {
    const { data, error } = await this.supabase
      .from('event_chat_rooms')
      .insert({
        event_id: eventId,
        name,
        room_type: roomType,
        active: true,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getRoomsByEvent(eventId: string) {
    const { data, error } = await this.supabase
      .from('event_chat_rooms')
      .select('*')
      .eq('event_id', eventId)
      .eq('active', true);

    if (error) throw error;
    return data;
  }

  async sendMessage(roomId: string, userId: string, message: string) {
    const { data, error } = await this.supabase
      .from('event_chat_messages')
      .insert({
        room_id: roomId,
        user_id: userId,
        message,
        message_type: 'text',
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getMessages(roomId: string, limit: number = 50) {
    const { data, error } = await this.supabase
      .from('event_chat_messages')
      .select(`
        *,
        user:user_id (
          id,
          email,
          user_metadata
        )
      `)
      .eq('room_id', roomId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data?.reverse() || [];
  }
}
```

**B. Create Chat API**
```typescript
// File: /src/app/api/v1/chat/[roomId]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ChatService } from '@/lib/services/chat.service';

export async function GET(
  req: NextRequest,
  { params }: { params: { roomId: string } }
) {
  const supabase = await createClient();
  const service = new ChatService(supabase);
  
  const messages = await service.getMessages(params.roomId);
  
  return NextResponse.json({ messages });
}

export async function POST(
  req: NextRequest,
  { params }: { params: { roomId: string } }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const { message } = await req.json();
  const service = new ChatService(supabase);
  
  const chatMessage = await service.sendMessage(params.roomId, user.id, message);
  
  return NextResponse.json({ message: chatMessage });
}
```

---

### 4. Third-Party Integrations
**Priority**: P0 (Critical)  
**Estimated Time**: 12 hours

#### A. Spotify Integration Enhancement

**File**: `/src/lib/integrations/spotify.ts` (enhance existing)

Add missing features:
- Artist top tracks
- Playlist creation
- User listening data
- Embed player generation

#### B. YouTube Integration Enhancement

**File**: `/src/lib/integrations/youtube.ts` (enhance existing)

Add missing features:
- Channel statistics
- Live streaming integration
- Video upload
- Playlist management

#### C. Twilio SMS Integration

**New File**: `/src/lib/integrations/twilio.ts`

```typescript
import twilio from 'twilio';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
);

export async function sendSMS(to: string, message: string) {
  return await client.messages.create({
    body: message,
    from: process.env.TWILIO_PHONE_NUMBER!,
    to,
  });
}

export async function sendEventReminder(
  phoneNumber: string,
  eventName: string,
  eventDate: string
) {
  const message = `Reminder: ${eventName} is coming up on ${eventDate}! Get ready! 🎉`;
  return await sendSMS(phoneNumber, message);
}
```

#### D. Shopify Integration

**New File**: `/src/lib/integrations/shopify.ts`

```typescript
import { createAdminApiClient } from '@shopify/admin-api-client';

const client = createAdminApiClient({
  storeDomain: process.env.SHOPIFY_STORE_DOMAIN!,
  apiVersion: '2024-01',
  accessToken: process.env.SHOPIFY_ACCESS_TOKEN!,
});

export async function syncProduct(productId: string) {
  // Sync product from Shopify to Supabase
}

export async function syncInventory() {
  // Sync inventory levels
}
```

---

### 5. Schedule Builder UI
**Priority**: P1 (High)  
**Estimated Time**: 8 hours

#### Implementation Steps:

**A. Create Schedule Grid Component**
```typescript
// File: /src/components/features/schedule/schedule-grid.tsx

'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface ScheduleItem {
  id: string;
  artist_id: string;
  artist_name: string;
  stage_id: string;
  stage_name: string;
  start_time: string;
  end_time: string;
}

export function ScheduleGrid({ eventId }: { eventId: string }) {
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [mySchedule, setMySchedule] = useState<Set<string>>(new Set());

  const addToMySchedule = (itemId: string) => {
    setMySchedule(prev => new Set(prev).add(itemId));
    // Save to database
    fetch('/api/v1/schedule/my-schedule', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventId, scheduleItemId: itemId }),
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {schedule.map(item => (
        <Card key={item.id} className="p-4">
          <div className="font-bold">{item.artist_name}</div>
          <div className="text-sm text-muted-foreground">{item.stage_name}</div>
          <div className="text-sm">
            {format(new Date(item.start_time), 'h:mm a')} -{' '}
            {format(new Date(item.end_time), 'h:mm a')}
          </div>
          <Button
            size="sm"
            className="mt-2"
            variant={mySchedule.has(item.id) ? 'default' : 'outline'}
            onClick={() => addToMySchedule(item.id)}
          >
            {mySchedule.has(item.id) ? '✓ Added' : 'Add to My Schedule'}
          </Button>
        </Card>
      ))}
    </div>
  );
}
```

---

### 6. Venue Maps
**Priority**: P1 (High)  
**Estimated Time**: 6 hours

#### Implementation Steps:

**A. Create Venue Map Component**
```typescript
// File: /src/components/features/venue/venue-map.tsx

'use client';

import { useState } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';

export function VenueMap({ eventId }: { eventId: string }) {
  const [selectedStage, setSelectedStage] = useState<string | null>(null);

  return (
    <TransformWrapper>
      <TransformComponent>
        <svg viewBox="0 0 1000 1000" className="w-full h-full">
          {/* Venue map SVG content */}
          <rect x="100" y="100" width="200" height="150" fill="#667eea" />
          <text x="200" y="175" textAnchor="middle" fill="white">
            Main Stage
          </text>
        </svg>
      </TransformComponent>
    </TransformWrapper>
  );
}
```

---

## 📋 REMAINING TASKS

### P1 - High Priority
- [ ] Advanced search (Algolia/Typesense)
- [ ] Real-time features (live updates)
- [ ] API documentation (Swagger/OpenAPI)
- [ ] Content management (rich text editor)

### P2 - Medium Priority
- [ ] Analytics dashboard
- [ ] Loyalty program UI
- [ ] Advanced ticketing features
- [ ] Internationalization (i18n)

### P3 - Low Priority
- [ ] AR/Web3 foundation
- [ ] Advanced POS integrations
- [ ] Discord/Slack integrations

---

## 🎯 DEPLOYMENT CHECKLIST

Before deploying to production:

### Environment Variables
- [ ] All API keys configured
- [ ] VAPID keys generated
- [ ] Stripe webhook secret set
- [ ] Resend API key set
- [ ] Supabase keys configured

### Database
- [ ] All migrations run
- [ ] RLS policies tested
- [ ] Indexes created
- [ ] Seed data loaded

### Testing
- [ ] Unit tests passing
- [ ] E2E tests passing
- [ ] Mobile responsiveness verified
- [ ] PWA functionality tested
- [ ] Push notifications tested

### Performance
- [ ] Lighthouse score > 90
- [ ] Core Web Vitals optimized
- [ ] Images optimized
- [ ] Code splitting verified

### Security
- [ ] Security headers configured
- [ ] CSRF protection enabled
- [ ] Rate limiting active
- [ ] API authentication tested

---

## 📞 SUPPORT

For implementation questions:
- Check existing code in `/src/lib/`
- Review database schema in `/supabase/migrations/`
- Refer to Next.js 15 documentation
- Consult Supabase documentation

---

**Last Updated**: January 7, 2025  
**Next Review**: After P0 items completed
