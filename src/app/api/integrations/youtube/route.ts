import { NextRequest, NextResponse } from 'next/server';
import {
  searchVideos,
  getVideoDetails,
  getChannelDetails,
  getChannelVideos,
  getPlaylistDetails,
  getPlaylistVideos,
  getLiveStreams,
} from '@/lib/integrations/youtube';

/**
 * GET /api/integrations/youtube
 * Search for videos or get channel/playlist data
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action');
    const query = searchParams.get('q');
    const videoId = searchParams.get('videoId');
    const channelId = searchParams.get('channelId');
    const playlistId = searchParams.get('playlistId');
    const maxResults = parseInt(searchParams.get('maxResults') || '10');

    switch (action) {
      case 'search':
        if (!query) {
          return NextResponse.json(
            { error: 'Query parameter required' },
            { status: 400 }
          );
        }
        const videos = await searchVideos(query, maxResults);
        return NextResponse.json({ videos });

      case 'video':
        if (!videoId) {
          return NextResponse.json(
            { error: 'Video ID required' },
            { status: 400 }
          );
        }
        const video = await getVideoDetails(videoId);
        return NextResponse.json({ video });

      case 'channel':
        if (!channelId) {
          return NextResponse.json(
            { error: 'Channel ID required' },
            { status: 400 }
          );
        }
        const channel = await getChannelDetails(channelId);
        return NextResponse.json({ channel });

      case 'channel-videos':
        if (!channelId) {
          return NextResponse.json(
            { error: 'Channel ID required' },
            { status: 400 }
          );
        }
        const channelVideos = await getChannelVideos(channelId, maxResults);
        return NextResponse.json({ videos: channelVideos });

      case 'playlist':
        if (!playlistId) {
          return NextResponse.json(
            { error: 'Playlist ID required' },
            { status: 400 }
          );
        }
        const playlist = await getPlaylistDetails(playlistId);
        return NextResponse.json({ playlist });

      case 'playlist-videos':
        if (!playlistId) {
          return NextResponse.json(
            { error: 'Playlist ID required' },
            { status: 400 }
          );
        }
        const playlistVideos = await getPlaylistVideos(playlistId, maxResults);
        return NextResponse.json({ videos: playlistVideos });

      case 'live':
        if (!channelId) {
          return NextResponse.json(
            { error: 'Channel ID required' },
            { status: 400 }
          );
        }
        const liveStreams = await getLiveStreams(channelId);
        return NextResponse.json({ videos: liveStreams });

      default:
        return NextResponse.json(
          {
            error:
              'Invalid action. Use: search, video, channel, channel-videos, playlist, playlist-videos, or live',
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('YouTube API error:', error);
    return NextResponse.json(
      { error: 'YouTube integration failed' },
      { status: 500 }
    );
  }
}
