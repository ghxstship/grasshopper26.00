import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ChatService } from '@/lib/services/chat.service';

/**
 * GET /api/v1/chat/[roomId]
 * Get messages for a chat room
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const supabase = await createClient();
    const service = new ChatService(supabase);

    const searchParams = req.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '50');
    const before = searchParams.get('before') || undefined;
    
    const { roomId } = await params;
    const messages = await service.getMessages(roomId, limit, before);

    return NextResponse.json({ messages });
  } catch (error) {
    console.error('Get chat messages error:', error);
    return NextResponse.json(
      { error: 'Failed to get messages' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/chat/[roomId]
 * Send a message to a chat room
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
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
    const { message, messageType } = body;

    if (!message || !message.trim()) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    const { roomId } = await params;
    const service = new ChatService(supabase);

    // Verify room exists and is active
    const room = await service.getRoom(roomId);
    if (!room) {
      return NextResponse.json(
        { error: 'Chat room not found' },
        { status: 404 }
      );
    }

    if (!room.active) {
      return NextResponse.json(
        { error: 'Chat room is not active' },
        { status: 403 }
      );
    }

    const chatMessage = await service.sendMessage(
      roomId,
      user.id,
      message.trim(),
      messageType || 'text'
    );

    return NextResponse.json({ message: chatMessage }, { status: 201 });
  } catch (error) {
    console.error('Send chat message error:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}
