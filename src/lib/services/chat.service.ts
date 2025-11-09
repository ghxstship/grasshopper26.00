/**
 * Chat Service
 * Handles event-based chat rooms and messages
 */

import { createClient } from '@/lib/supabase/server';
import { Database } from '@/types/database';

// Fallback types for chat tables (may not exist in current database schema)
type ChatRoom = any;
type ChatMessage = any;

export class ChatService {
  private supabase: Awaited<ReturnType<typeof createClient>>;

  constructor(supabase: Awaited<ReturnType<typeof createClient>>) {
    this.supabase = supabase;
  }

  /**
   * Create a new chat room for an event
   */
  async createRoom(
    eventId: string,
    name: string,
    options: {
      description?: string;
      roomType?: 'public' | 'private' | 'stage';
      stageId?: string;
      maxParticipants?: number;
    } = {}
  ): Promise<ChatRoom> {
    const { data, error } = await this.supabase
      .from('event_chat_rooms')
      .insert({
        event_id: eventId,
        name,
        description: options.description || null,
        room_type: options.roomType || 'public',
        stage_id: options.stageId || null,
        max_participants: options.maxParticipants || null,
        active: true,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create chat room: ${error.message}`);
    }

    return data;
  }

  /**
   * Get all chat rooms for an event
   */
  async getRoomsByEvent(eventId: string) {
    const { data, error } = await this.supabase
      .from('event_chat_rooms')
      .select(`
        *,
        stage:stage_id (
          id,
          name,
          stage_type
        )
      `)
      .eq('event_id', eventId)
      .eq('active', true)
      .order('created_at', { ascending: true });

    if (error) {
      throw new Error(`Failed to get chat rooms: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get a specific chat room
   */
  async getRoom(roomId: string): Promise<ChatRoom | null> {
    const { data, error } = await this.supabase
      .from('event_chat_rooms')
      .select(`
        *,
        stage:stage_id (
          id,
          name,
          stage_type
        ),
        event:event_id (
          id,
          name,
          slug
        )
      `)
      .eq('id', roomId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw new Error(`Failed to get chat room: ${error.message}`);
    }

    return data;
  }

  /**
   * Send a message to a chat room
   */
  async sendMessage(
    roomId: string,
    userId: string,
    message: string,
    messageType: 'text' | 'image' | 'system' = 'text'
  ): Promise<ChatMessage> {
    const { data, error } = await this.supabase
      .from('event_chat_messages')
      .insert({
        room_id: roomId,
        user_id: userId,
        message,
        message_type: messageType,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to send message: ${error.message}`);
    }

    return data;
  }

  /**
   * Get messages for a chat room
   */
  async getMessages(roomId: string, limit: number = 50, before?: string) {
    let query = this.supabase
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

    if (before) {
      query = query.lt('created_at', before);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to get messages: ${error.message}`);
    }

    // Return in chronological order (oldest first)
    return (data || []).reverse();
  }

  /**
   * Update chat room settings
   */
  async updateRoom(
    roomId: string,
    updates: {
      name?: string;
      description?: string;
      active?: boolean;
      maxParticipants?: number;
    }
  ): Promise<ChatRoom> {
    const { data, error } = await this.supabase
      .from('event_chat_rooms')
      .update(updates)
      .eq('id', roomId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update chat room: ${error.message}`);
    }

    return data;
  }

  /**
   * Delete a chat room (soft delete by setting active = false)
   */
  async deleteRoom(roomId: string): Promise<void> {
    const { error } = await this.supabase
      .from('event_chat_rooms')
      .update({ active: false })
      .eq('id', roomId);

    if (error) {
      throw new Error(`Failed to delete chat room: ${error.message}`);
    }
  }

  /**
   * Get participant count for a room (approximate)
   */
  async getParticipantCount(roomId: string, timeWindow: number = 300000): Promise<number> {
    // Count unique users who sent messages in the last timeWindow milliseconds
    const since = new Date(Date.now() - timeWindow).toISOString();

    const { data, error } = await this.supabase
      .from('event_chat_messages')
      .select('user_id')
      .eq('room_id', roomId)
      .gte('created_at', since);

    if (error) {
      throw new Error(`Failed to get participant count: ${error.message}`);
    }

    const uniqueUsers = new Set(data?.map((m: any) => m.user_id) || []);
    return uniqueUsers.size;
  }

  /**
   * Send system message (announcements, alerts)
   */
  async sendSystemMessage(roomId: string, message: string): Promise<ChatMessage> {
    const { data: { user } } = await this.supabase.auth.getUser();
    
    if (!user) {
      throw new Error('Must be authenticated to send system messages');
    }

    return await this.sendMessage(roomId, user.id, message, 'system');
  }

  /**
   * Search messages in a room
   */
  async searchMessages(roomId: string, query: string, limit: number = 20) {
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
      .ilike('message', `%${query}%`)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to search messages: ${error.message}`);
    }

    return data || [];
  }
}
