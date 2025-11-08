/**
 * Messaging Service
 * Handles direct messaging between users
 */

import { createClient } from '@/lib/supabase/server';
import { Database } from '@/types/database';

type Message = Database['public']['Tables']['user_messages']['Row'];
type MessageInsert = Database['public']['Tables']['user_messages']['Insert'];

export class MessagingService {
  private supabase: Awaited<ReturnType<typeof createClient>>;

  constructor(supabase: Awaited<ReturnType<typeof createClient>>) {
    this.supabase = supabase;
  }

  /**
   * Send a message to another user
   */
  async sendMessage(data: MessageInsert): Promise<Message> {
    const { data: message, error } = await this.supabase
      .from('user_messages')
      .insert(data)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to send message: ${error.message}`);
    }

    return message;
  }

  /**
   * Get conversation between two users
   */
  async getConversation(userId: string, otherUserId: string, limit: number = 50) {
    const { data, error } = await this.supabase
      .from('user_messages')
      .select(`
        *,
        sender:sender_id (
          id,
          email,
          user_metadata
        ),
        recipient:recipient_id (
          id,
          email,
          user_metadata
        )
      `)
      .or(`and(sender_id.eq.${userId},recipient_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},recipient_id.eq.${userId})`)
      .order('created_at', { ascending: true })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to get conversation: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get all conversations for a user
   */
  async getConversations(userId: string) {
    const { data, error } = await this.supabase
      .from('user_messages')
      .select(`
        *,
        sender:sender_id (
          id,
          email,
          user_metadata
        ),
        recipient:recipient_id (
          id,
          email,
          user_metadata
        )
      `)
      .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to get conversations: ${error.message}`);
    }

    // Group by conversation partner
    const conversations = new Map();
    
    data?.forEach((message: any) => {
      const partnerId = message.sender_id === userId ? message.recipient_id : message.sender_id;
      const partner = message.sender_id === userId ? message.recipient : message.sender;
      
      if (!conversations.has(partnerId)) {
        conversations.set(partnerId, {
          partnerId,
          partner,
          lastMessage: message,
          unreadCount: 0,
        });
      }
      
      // Count unread messages
      if (message.recipient_id === userId && !message.read) {
        const conv = conversations.get(partnerId);
        conv.unreadCount++;
      }
    });

    return Array.from(conversations.values());
  }

  /**
   * Mark messages as read
   */
  async markAsRead(userId: string, senderId: string): Promise<void> {
    const { error } = await this.supabase.rpc('mark_messages_read', {
      p_user_id: userId,
      p_sender_id: senderId,
    });

    if (error) {
      throw new Error(`Failed to mark messages as read: ${error.message}`);
    }
  }

  /**
   * Get unread message count
   */
  async getUnreadCount(userId: string): Promise<number> {
    const { data, error } = await this.supabase.rpc('get_unread_message_count', {
      p_user_id: userId,
    });

    if (error) {
      throw new Error(`Failed to get unread count: ${error.message}`);
    }

    return data || 0;
  }

  /**
   * Delete a message
   */
  async deleteMessage(messageId: string, userId: string): Promise<void> {
    const { error } = await this.supabase
      .from('user_messages')
      .delete()
      .eq('id', messageId)
      .eq('sender_id', userId); // Only sender can delete

    if (error) {
      throw new Error(`Failed to delete message: ${error.message}`);
    }
  }

  /**
   * Search messages
   */
  async searchMessages(userId: string, query: string, limit: number = 20) {
    const { data, error } = await this.supabase
      .from('user_messages')
      .select(`
        *,
        sender:sender_id (
          id,
          email,
          user_metadata
        ),
        recipient:recipient_id (
          id,
          email,
          user_metadata
        )
      `)
      .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
      .ilike('message', `%${query}%`)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to search messages: ${error.message}`);
    }

    return data || [];
  }
}
