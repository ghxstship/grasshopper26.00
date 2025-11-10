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
import styles from './message-thread.module.css';

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
      <Card className={styles.loadingCard}>
        <p className={styles.loadingText}>Loading messages...</p>
      </Card>
    );
  }

  return (
    <Card className={cn(styles.threadCard, className)}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerInfo}>
          <Avatar className={styles.avatar}>
            {otherUserAvatar && (
              <Image 
                src={otherUserAvatar} 
                alt={otherUserName || 'User'} 
                width={40}
                height={40}
                className={styles.avatarImage}
              />
            )}
          </Avatar>
          <div>
            <h3 className={styles.userName}>{otherUserName || 'User'}</h3>
            <p className={styles.userStatus}>Active now</p>
          </div>
        </div>
        <div className={styles.headerActions}>
          <Button variant="ghost" size="icon">
            <Search className={styles.icon} />
          </Button>
          <Button variant="ghost" size="icon">
            <MoreVertical className={styles.icon} />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className={styles.messagesContainer}>
        {messages.length === 0 ? (
          <div className={styles.emptyState}>
            <p className={styles.emptyText}>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          <div className={styles.messagesContainerWithGap}>
          {messages.map((msg) => {
            const isOwnMessage = msg.sender_id === currentUserId;
            return (
              <div
                key={msg.id}
                className={cn(
                  styles.messageWrapper,
                  isOwnMessage && styles.messageWrapperOwn
                )}
              >
                {!isOwnMessage && (
                  <Avatar className={styles.messageAvatar}>
                    {otherUserAvatar && (
                      <Image 
                        src={otherUserAvatar} 
                        alt={otherUserName || 'User'} 
                        width={32}
                        height={32}
                        className={styles.avatarImage}
                      />
                    )}
                  </Avatar>
                )}
                <div
                  className={cn(
                    styles.messageContent,
                    styles.messageContentWithGap,
                    isOwnMessage && styles.messageContentOwn
                  )}
                >
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
                  <div className={styles.messageFooter}>
                    <p className={styles.messageTime}>
                      {format(new Date(msg.created_at), 'h:mm a')}
                    </p>
                    {isOwnMessage && msg.read && (
                      <Badge variant="outline" className={styles.readBadge}>
                        Read
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          </div>
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
            placeholder="Type a message..."
            disabled={sending}
            className={styles.input}
          />
          <Button
            onClick={sendMessage}
            disabled={!newMessage.trim() || sending}
            size="icon"
          >
            <Send className={styles.icon} />
          </Button>
        </div>
        <p className={styles.inputHint}>
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </Card>
  );
}
