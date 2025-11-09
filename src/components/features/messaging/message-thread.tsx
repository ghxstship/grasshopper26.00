/**
 * Message Thread Component
 * Real-time messaging interface between users
 */

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/design-system/components/atoms/button';
import { Input } from '@/design-system/components/atoms/input';
import { Card } from '@/design-system/components/atoms/card';
import { Avatar } from '@/design-system/components/atoms/avatar';
import { Badge } from '@/design-system/components/atoms/badge';
import { Send, MoreVertical, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import Image from 'next/image';

interface MessageThreadProps {
  otherUserId: string;
  otherUserName?: string;
  otherUserAvatar?: string;
  className?: string;
}

interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  message: string;
  read: boolean;
  read_at: string | null;
  created_at: string;
  sender?: {
    id: string;
    email: string;
    user_metadata?: {
      name?: string;
      avatar_url?: string;
    };
  };
}

export function MessageThread({
  otherUserId,
  otherUserName,
  otherUserAvatar,
  className,
}: MessageThreadProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  const getCurrentUser = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUserId(user?.id || null);
  }, [supabase]);

  const loadMessages = useCallback(async () => {
    try {
      const res = await fetch(`/api/v1/messages?userId=${otherUserId}`);
      const data = await res.json();
      setMessages(data.messages || []);
      scrollToBottom();
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setLoading(false);
    }
  }, [otherUserId]);

  const subscribeToMessages = useCallback(() => {
    const channel = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'user_messages',
          filter: `recipient_id=eq.${currentUserId}`,
        },
        (payload) => {
          const newMsg = payload.new as Message;
          if (newMsg.sender_id === otherUserId) {
            setMessages((prev) => [...prev, newMsg]);
            scrollToBottom();
            markAsRead();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase, currentUserId, otherUserId]);

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
      const res = await fetch('/api/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientId: otherUserId,
          message: newMessage.trim(),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [...prev, data.message]);
        setNewMessage('');
        scrollToBottom();
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSending(false);
    }
  };

  const markAsRead = async () => {
    try {
      await fetch(`/api/v1/messages/read`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senderId: otherUserId }),
      });
    } catch (error) {
      console.error('Failed to mark as read:', error);
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

  if (loading) {
    return (
      <Card className="flex items-center justify-center h-[600px]">
        <p className="text-muted-foreground">Loading messages...</p>
      </Card>
    );
  }

  return (
    <Card className={cn('flex flex-col h-[600px]', className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            {otherUserAvatar && (
              <Image 
                src={otherUserAvatar} 
                alt={otherUserName || 'User'} 
                width={40}
                height={40}
                className="rounded-full"
              />
            )}
          </Avatar>
          <div>
            <h3 className="font-semibold">{otherUserName || 'User'}</h3>
            <p className="text-xs text-muted-foreground">Active now</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon">
            <Search className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isOwnMessage = msg.sender_id === currentUserId;
            return (
              <div
                key={msg.id}
                className={cn(
                  'flex gap-2',
                  isOwnMessage ? 'justify-end' : 'justify-start'
                )}
              >
                {!isOwnMessage && (
                  <Avatar className="h-8 w-8">
                    {otherUserAvatar && (
                      <Image 
                        src={otherUserAvatar} 
                        alt={otherUserName || 'User'} 
                        width={32}
                        height={32}
                        className="rounded-full"
                      />
                    )}
                  </Avatar>
                )}
                <div
                  className={cn(
                    'max-w-[70%] space-y-1',
                    isOwnMessage && 'items-end'
                  )}
                >
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
                  <div className="flex items-center gap-2 px-1">
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(msg.created_at), 'h:mm a')}
                    </p>
                    {isOwnMessage && msg.read && (
                      <Badge variant="outline" className="text-xs">
                        Read
                      </Badge>
                    )}
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
            placeholder="Type a message..."
            disabled={sending}
            className="flex-1"
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
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </Card>
  );
}
