import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { MessagingService } from '@/lib/services/messaging.service';

/**
 * GET /api/v1/messages
 * Get messages for a conversation or all conversations
 */
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const searchParams = req.nextUrl.searchParams;
    const otherUserId = searchParams.get('userId');
    const action = searchParams.get('action');

    const service = new MessagingService(supabase);

    // Get unread count
    if (action === 'unread-count') {
      const count = await service.getUnreadCount(user.id);
      return NextResponse.json({ count });
    }

    // Get all conversations
    if (!otherUserId) {
      const conversations = await service.getConversations(user.id);
      return NextResponse.json({ conversations });
    }

    // Get specific conversation
    const messages = await service.getConversation(user.id, otherUserId);
    
    // Mark messages as read
    await service.markAsRead(user.id, otherUserId);

    return NextResponse.json({ messages });
  } catch (error) {
    console.error('Get messages error:', error);
    return NextResponse.json(
      { error: 'Failed to get messages' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/messages
 * Send a new message
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { recipientId, message, metadata } = body;

    if (!recipientId || !message) {
      return NextResponse.json(
        { error: 'recipientId and message are required' },
        { status: 400 }
      );
    }

    // Prevent sending messages to self
    if (recipientId === user.id) {
      return NextResponse.json(
        { error: 'Cannot send message to yourself' },
        { status: 400 }
      );
    }

    const service = new MessagingService(supabase);

    const newMessage = await service.sendMessage({
      sender_id: user.id,
      recipient_id: recipientId,
      message: message.trim(),
      metadata: metadata || null,
    });

    // TODO: Send push notification to recipient
    // TODO: Send email notification if user has email notifications enabled

    return NextResponse.json({ message: newMessage }, { status: 201 });
  } catch (error) {
    console.error('Send message error:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/v1/messages
 * Delete a message
 */
export async function DELETE(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const searchParams = req.nextUrl.searchParams;
    const messageId = searchParams.get('messageId');

    if (!messageId) {
      return NextResponse.json(
        { error: 'messageId is required' },
        { status: 400 }
      );
    }

    const service = new MessagingService(supabase);
    await service.deleteMessage(messageId, user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete message error:', error);
    return NextResponse.json(
      { error: 'Failed to delete message' },
      { status: 500 }
    );
  }
}
