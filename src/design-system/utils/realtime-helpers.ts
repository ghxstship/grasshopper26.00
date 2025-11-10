/**
 * Realtime Helper Utilities
 * GHXSTSHIP Entertainment Platform Real-time Features (Supabase Realtime)
 */

export type RealtimeEvent = 'INSERT' | 'UPDATE' | 'DELETE';

export interface RealtimeSubscription {
  id: string;
  channel: string;
  unsubscribe: () => void;
}

export interface RealtimeMessage<T = unknown> {
  event: RealtimeEvent;
  payload: T;
  timestamp: number;
}

/**
 * Create realtime channel name
 */
export function createChannelName(table: string, filter?: string): string {
  return filter ? `${table}:${filter}` : table;
}

/**
 * Format realtime event
 */
export function formatRealtimeEvent<T>(
  event: RealtimeEvent,
  payload: T
): RealtimeMessage<T> {
  return {
    event,
    payload,
    timestamp: Date.now(),
  };
}

/**
 * Subscribe to table changes
 */
export function subscribeToTable<T>(
  table: string,
  callback: (message: RealtimeMessage<T>) => void,
  filter?: { column: string; value: string }
): RealtimeSubscription {
  const channelName = filter
    ? createChannelName(table, `${filter.column}=eq.${filter.value}`)
    : createChannelName(table);

  const id = `sub-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Placeholder - in production, use Supabase realtime
  const unsubscribe = () => {
    console.log(`Unsubscribed from ${channelName}`);
  };

  return {
    id,
    channel: channelName,
    unsubscribe,
  };
}

/**
 * Subscribe to live event updates
 */
export function subscribeToEventUpdates(
  eventId: string,
  callback: (event: RealtimeMessage) => void
): RealtimeSubscription {
  return subscribeToTable('events', callback, {
    column: 'id',
    value: eventId,
  });
}

/**
 * Subscribe to ticket sales
 */
export function subscribeToTicketSales(
  eventId: string,
  callback: (sale: RealtimeMessage) => void
): RealtimeSubscription {
  return subscribeToTable('ticket_sales', callback, {
    column: 'event_id',
    value: eventId,
  });
}

/**
 * Subscribe to live chat
 */
export function subscribeToLiveChat(
  roomId: string,
  callback: (message: RealtimeMessage) => void
): RealtimeSubscription {
  return subscribeToTable('chat_messages', callback, {
    column: 'room_id',
    value: roomId,
  });
}

/**
 * Broadcast presence
 */
export function broadcastPresence(
  channel: string,
  userId: string,
  status: 'online' | 'away' | 'offline'
): void {
  console.log(`Broadcasting presence: ${userId} is ${status} in ${channel}`);
  // Placeholder - in production, use Supabase presence
}

/**
 * Track online users
 */
export function trackOnlineUsers(
  channel: string,
  callback: (users: Array<{ id: string; status: string }>) => void
): () => void {
  console.log(`Tracking online users in ${channel}`);
  // Placeholder - in production, use Supabase presence

  return () => {
    console.log(`Stopped tracking users in ${channel}`);
  };
}

/**
 * Send realtime message
 */
export function sendRealtimeMessage<T>(
  channel: string,
  event: string,
  payload: T
): void {
  console.log(`Sending message to ${channel}:`, event, payload);
  // Placeholder - in production, use Supabase broadcast
}

/**
 * Create live feed subscription
 */
export function subscribeToLiveFeed(
  callback: (update: RealtimeMessage) => void
): RealtimeSubscription {
  return subscribeToTable('live_feed', callback);
}

/**
 * Subscribe to schedule changes
 */
export function subscribeToScheduleChanges(
  eventId: string,
  callback: (change: RealtimeMessage) => void
): RealtimeSubscription {
  return subscribeToTable('event_schedule', callback, {
    column: 'event_id',
    value: eventId,
  });
}

/**
 * Subscribe to capacity updates
 */
export function subscribeToCapacityUpdates(
  venueId: string,
  callback: (update: RealtimeMessage<{ current: number; max: number }>) => void
): RealtimeSubscription {
  return subscribeToTable('venue_capacity', callback, {
    column: 'venue_id',
    value: venueId,
  });
}

/**
 * Create notification channel
 */
export function createNotificationChannel(
  userId: string,
  callback: (notification: RealtimeMessage) => void
): RealtimeSubscription {
  return subscribeToTable('notifications', callback, {
    column: 'user_id',
    value: userId,
  });
}

/**
 * Batch subscribe to multiple channels
 */
export function batchSubscribe(
  subscriptions: Array<{
    table: string;
    filter?: { column: string; value: string };
    callback: (message: RealtimeMessage) => void;
  }>
): RealtimeSubscription[] {
  return subscriptions.map(sub =>
    subscribeToTable(sub.table, sub.callback, sub.filter)
  );
}

/**
 * Unsubscribe from all
 */
export function unsubscribeAll(subscriptions: RealtimeSubscription[]): void {
  subscriptions.forEach(sub => sub.unsubscribe());
}

/**
 * Create heartbeat monitor
 */
export function createHeartbeatMonitor(
  interval: number = 30000,
  onDisconnect?: () => void
): {
  start: () => void;
  stop: () => void;
} {
  let intervalId: NodeJS.Timeout;
  let lastHeartbeat = Date.now();

  const start = () => {
    intervalId = setInterval(() => {
      const now = Date.now();
      if (now - lastHeartbeat > interval * 2) {
        onDisconnect?.();
      }
      lastHeartbeat = now;
    }, interval);
  };

  const stop = () => {
    clearInterval(intervalId);
  };

  return { start, stop };
}

/**
 * Reconnect handler
 */
export function createReconnectHandler(
  onReconnect: () => void,
  maxRetries: number = 5,
  baseDelay: number = 1000
): {
  attempt: () => void;
  reset: () => void;
} {
  let retries = 0;

  const attempt = () => {
    if (retries >= maxRetries) {
      console.error('Max reconnection attempts reached');
      return;
    }

    const delay = baseDelay * Math.pow(2, retries);
    setTimeout(() => {
      onReconnect();
      retries++;
    }, delay);
  };

  const reset = () => {
    retries = 0;
  };

  return { attempt, reset };
}

/**
 * Create live counter
 */
export function createLiveCounter(
  initialValue: number = 0
): {
  value: number;
  increment: () => number;
  decrement: () => number;
  set: (value: number) => number;
  get: () => number;
} {
  let value = initialValue;

  return {
    value,
    increment: () => ++value,
    decrement: () => --value,
    set: (newValue: number) => (value = newValue),
    get: () => value,
  };
}

/**
 * Debounce realtime updates
 */
export function debounceRealtimeUpdate<T>(
  callback: (data: T) => void,
  delay: number = 500
): (data: T) => void {
  let timeoutId: NodeJS.Timeout;
  let pending: T | null = null;

  return (data: T) => {
    pending = data;
    clearTimeout(timeoutId);

    timeoutId = setTimeout(() => {
      if (pending) {
        callback(pending);
        pending = null;
      }
    }, delay);
  };
}

/**
 * Throttle realtime updates
 */
export function throttleRealtimeUpdate<T>(
  callback: (data: T) => void,
  limit: number = 1000
): (data: T) => void {
  let lastCall = 0;

  return (data: T) => {
    const now = Date.now();
    if (now - lastCall >= limit) {
      callback(data);
      lastCall = now;
    }
  };
}

/**
 * Create event emitter
 */
export function createEventEmitter<T = unknown>() {
  const listeners = new Map<string, Array<(data: T) => void>>();

  return {
    on: (event: string, callback: (data: T) => void) => {
      if (!listeners.has(event)) {
        listeners.set(event, []);
      }
      listeners.get(event)!.push(callback);
    },

    off: (event: string, callback: (data: T) => void) => {
      const eventListeners = listeners.get(event);
      if (eventListeners) {
        const index = eventListeners.indexOf(callback);
        if (index > -1) {
          eventListeners.splice(index, 1);
        }
      }
    },

    emit: (event: string, data: T) => {
      const eventListeners = listeners.get(event);
      if (eventListeners) {
        eventListeners.forEach(callback => callback(data));
      }
    },

    clear: () => {
      listeners.clear();
    },
  };
}

/**
 * Create websocket connection manager
 */
export function createWebSocketManager(url: string) {
  let ws: WebSocket | null = null;
  const emitter = createEventEmitter();

  return {
    connect: () => {
      ws = new WebSocket(url);

      ws.onopen = () => emitter.emit('connected', null);
      ws.onclose = () => emitter.emit('disconnected', null);
      ws.onerror = (error) => emitter.emit('error', error);
      ws.onmessage = (event) => emitter.emit('message', event.data);
    },

    disconnect: () => {
      ws?.close();
      ws = null;
    },

    send: (data: unknown) => {
      if (ws?.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(data));
      }
    },

    on: emitter.on,
    off: emitter.off,
  };
}
