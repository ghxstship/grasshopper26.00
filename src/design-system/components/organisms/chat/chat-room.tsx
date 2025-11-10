/**
 * Chat Room Component
 * Real-time event-based chat room
 */

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/design-system/components/atoms/button';
import { Input } from '@/design-system/components/atoms/input';
import { Card } from '@/design-system/components/atoms/card';
import { Avatar } from '@/design-system/components/atoms/avatar';
import { Badge } from '@/design-system/components/atoms/badge';
import { Send, Users, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import Image from 'next/image';
import styles from './chat-room.module.css';

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
      <Card className={styles.loadingContainer}>
        <p className={styles.loadingText}>Loading chat...</p>
      </Card>
    );
  }

  return (
    <Card className={cn(styles.chatRoom, className)}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h3 className={styles.headerTitle}>{roomName || 'Chat Room'}</h3>
          <div className={styles.headerMeta}>
            <Users className={styles.headerIcon} />
            <span>{participantCount} participants</span>
          </div>
        </div>
        <Button variant="ghost" size="icon">
          <Settings className={styles.icon} />
        </Button>
      </div>

      {/* Messages */}
      <div className={styles.messagesContainer}>
        {messages.length === 0 ? (
          <div className={styles.emptyState}>
            <p className={styles.emptyText}>No messages yet. Be the first to say something!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isOwnMessage = msg.user_id === currentUserId;
            const isSystemMessage = msg.message_type === 'system';

            if (isSystemMessage) {
              return (
                <div key={msg.id} className={styles.systemMessage}>
                  <Badge variant="secondary" className={styles.systemBadge}>
                    {msg.message}
                  </Badge>
                </div>
              );
            }

            return (
              <div
                key={msg.id}
                className={cn(
                  styles.messageWrapper,
                  isOwnMessage && styles.messageWrapperOwn
                )}
              >
                <Avatar className={styles.avatar}>
                  {getUserAvatar(msg) && (
                    <Image 
                      src={getUserAvatar(msg)!} 
                      alt={getUserName(msg)} 
                      width={32}
                      height={32}
                      className=""
                    />
                  )}
                </Avatar>
                <div
                  className={cn(
                    styles.messageContent,
                    isOwnMessage && styles.messageContentOwn
                  )}
                >
                  <div className={styles.messageMeta}>
                    <p className={styles.messageAuthor}>{getUserName(msg)}</p>
                    <p className={styles.messageTime}>
                      {format(new Date(msg.created_at), 'h:mm a')}
                    </p>
                  </div>
                  <div
                    className={cn(
                      styles.messageBubble,
                      isOwnMessage
                        ? styles.messageBubbleOwn
                        : styles.messageBubbleOther
                    )}
                  >
                    <p className={styles.messageText}>
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
      <div className={styles.inputContainer}>
        <div className={styles.inputWrapper}>
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Send a message..."
            disabled={sending}
            className={styles.input}
            maxLength={500}
          />
          <Button
            onClick={sendMessage}
            disabled={!newMessage.trim() || sending}
            size="icon"
          >
            <Send className={styles.icon} />
          </Button>
        </div>
        <p className={styles.inputMeta}>
          Press Enter to send • {newMessage.length}/500
        </p>
      </div>
    </Card>
  );
}
