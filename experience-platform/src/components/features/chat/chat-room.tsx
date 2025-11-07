/**
 * Chat Room Component
 * Real-time event-based chat room
 */

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Send, Users, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import Image from 'next/image';

interface ChatRoomProps {
  roomId: string;
  roomName?: string;
  className?: string;
}

interface ChatMessage {
  id: string;
  room_id: string;
  user_id: string;
  message: string;
  message_type: 'text' | 'image' | 'system';
  created_at: string;
  user?: {
    id: string;
    email: string;
    user_metadata?: {
      name?: string;
      avatar_url?: string;
    };
  };
}

export function ChatRoom({ roomId, roomName, className }: ChatRoomProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [participantCount, setParticipantCount] = useState(0);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  const getCurrentUser = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUserId(user?.id || null);
  }, [supabase]);

  const loadMessages = useCallback(async () => {
    try {
      const res = await fetch(`/api/v1/chat/${roomId}?limit=100`);
      const data = await res.json();
      setMessages(data.messages || []);
      scrollToBottom();
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  const subscribeToMessages = useCallback(() => {
    const channel = supabase
      .channel(`chat-room-${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'event_chat_messages',
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          const newMsg = payload.new as ChatMessage;
          setMessages((prev) => [...prev, newMsg]);
          scrollToBottom();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, roomId]);

  useEffect(() => {
    loadMessages();
    getCurrentUser();
    const cleanup = subscribeToMessages();
    return cleanup;
  }, [loadMessages, getCurrentUser, subscribeToMessages]);

  const sendMessage = async () => {
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      const res = await fetch(`/api/v1/chat/${roomId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: newMessage.trim(),
        }),
      });

      if (res.ok) {
        setNewMessage('');
        scrollToBottom();
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSending(false);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getUserName = (msg: ChatMessage) => {
    return msg.user?.user_metadata?.name || msg.user?.email?.split('@')[0] || 'User';
  };

  const getUserAvatar = (msg: ChatMessage) => {
    return msg.user?.user_metadata?.avatar_url;
  };

  if (loading) {
    return (
      <Card className="flex items-center justify-center h-[600px]">
        <p className="text-muted-foreground">Loading chat...</p>
      </Card>
    );
  }

  return (
    <Card className={cn('flex flex-col h-[600px]', className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div>
          <h3 className="font-semibold">{roomName || 'Chat Room'}</h3>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Users className="h-3 w-3" />
            <span>{participantCount} participants</span>
          </div>
        </div>
        <Button variant="ghost" size="icon">
          <Settings className="h-4 w-4" />
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">No messages yet. Be the first to say something!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isOwnMessage = msg.user_id === currentUserId;
            const isSystemMessage = msg.message_type === 'system';

            if (isSystemMessage) {
              return (
                <div key={msg.id} className="flex justify-center">
                  <Badge variant="secondary" className="text-xs">
                    {msg.message}
                  </Badge>
                </div>
              );
            }

            return (
              <div
                key={msg.id}
                className={cn(
                  'flex gap-2',
                  isOwnMessage && 'flex-row-reverse'
                )}
              >
                <Avatar className="h-8 w-8">
                  {getUserAvatar(msg) && (
                    <Image 
                      src={getUserAvatar(msg)!} 
                      alt={getUserName(msg)} 
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                  )}
                </Avatar>
                <div
                  className={cn(
                    'max-w-[70%] space-y-1',
                    isOwnMessage && 'items-end'
                  )}
                >
                  <div className="flex items-center gap-2 px-1">
                    <p className="text-xs font-medium">{getUserName(msg)}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(msg.created_at), 'h:mm a')}
                    </p>
                  </div>
                  <div
                    className={cn(
                      'rounded-lg px-4 py-2',
                      isOwnMessage
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    )}
                  >
                    <p className="text-sm whitespace-pre-wrap break-words">
                      {msg.message}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Send a message..."
            disabled={sending}
            className="flex-1"
            maxLength={500}
          />
          <Button
            onClick={sendMessage}
            disabled={!newMessage.trim() || sending}
            size="icon"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Press Enter to send • {newMessage.length}/500
        </p>
      </div>
    </Card>
  );
}
