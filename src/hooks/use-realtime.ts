import { useEffect, useState } from 'react';
import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';

type RealtimeEvent = 'INSERT' | 'UPDATE' | 'DELETE' | '*';

interface UseRealtimeOptions {
  event?: RealtimeEvent;
  schema?: string;
  filter?: string;
}

/**
 * Hook for subscribing to Supabase Realtime changes
 * 
 * @param table - Table name to subscribe to
 * @param callback - Callback function when changes occur
 * @param options - Additional options (event type, schema, filter)
 */
export function useRealtimeSubscription<T extends Record<string, any> = any>(
  table: string,
  callback: (payload: RealtimePostgresChangesPayload<T>) => void,
  options: UseRealtimeOptions = {}
) {
  const { event = '*', schema = 'public', filter } = options;
  const supabase = createClient();

  useEffect(() => {
    let channel: RealtimeChannel;

    const setupSubscription = () => {
      const channelConfig: any = {
        event,
        schema,
        table,
      };
      
      if (filter) {
        channelConfig.filter = filter;
      }

      channel = supabase
        .channel(`${table}-changes`)
        .on(
          'postgres_changes' as any,
          channelConfig,
          callback as any
        )
        .subscribe();
    };

    setupSubscription();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [table, event, schema, filter, callback, supabase]);
}

/**
 * Hook for subscribing to realtime data with automatic state management
 * 
 * @param table - Table name to subscribe to
 * @param initialData - Initial data
 * @param options - Additional options
 * @returns Current data state
 */
export function useRealtimeData<T extends Record<string, any> = any>(
  table: string,
  initialData: T[] = [],
  options: UseRealtimeOptions = {}
): T[] {
  const [data, setData] = useState<T[]>(initialData);

  useRealtimeSubscription<T>(
    table,
    (payload) => {
      if (payload.eventType === 'INSERT') {
        setData((current) => [...current, payload.new as T]);
      } else if (payload.eventType === 'UPDATE') {
        setData((current) =>
          current.map((item: any) =>
            item.id === (payload.new as any).id ? (payload.new as T) : item
          )
        );
      } else if (payload.eventType === 'DELETE') {
        setData((current) =>
          current.filter((item: any) => item.id !== (payload.old as any).id)
        );
      }
    },
    options
  );

  return data;
}

/**
 * Hook for presence tracking (who's online)
 * 
 * @param channelName - Unique channel name
 * @param userId - Current user ID
 * @param metadata - Additional user metadata
 */
export function usePresence(
  channelName: string,
  userId: string | null,
  metadata: Record<string, any> = {}
) {
  const [presenceState, setPresenceState] = useState<Record<string, any>>({});
  const [onlineUsers, setOnlineUsers] = useState<any[]>([]);
  const supabase = createClient();

  useEffect(() => {
    if (!userId) return;

    const channel = supabase.channel(channelName, {
      config: {
        presence: {
          key: userId,
        },
      },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        setPresenceState(state);
        
        // Convert presence state to array of users
        const users = Object.values(state).flat();
        setOnlineUsers(users);
      })
      .on('presence', { event: 'join' }, ({ newPresences }: any) => {
        console.log('User joined:', newPresences);
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }: any) => {
        console.log('User left:', leftPresences);
      })
      .subscribe(async (status: string) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            user_id: userId,
            online_at: new Date().toISOString(),
            ...metadata,
          });
        }
      });

    return () => {
      channel.untrack();
      supabase.removeChannel(channel);
    };
  }, [channelName, userId, metadata, supabase]);

  return { presenceState, onlineUsers };
}

/**
 * Hook for broadcast messaging (real-time chat, notifications)
 * 
 * @param channelName - Unique channel name
 */
export function useBroadcast(channelName: string) {
  const [messages, setMessages] = useState<any[]>([]);
  const supabase = createClient();
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  useEffect(() => {
    const newChannel = supabase.channel(channelName);

    newChannel
      .on('broadcast', { event: 'message' }, (payload: any) => {
        setMessages((current) => [...current, payload.payload]);
      })
      .subscribe();

    setChannel(newChannel);

    return () => {
      supabase.removeChannel(newChannel);
    };
  }, [channelName, supabase]);

  const sendMessage = async (message: any) => {
    if (channel) {
      await channel.send({
        type: 'broadcast',
        event: 'message',
        payload: message,
      });
    }
  };

  return { messages, sendMessage };
}
