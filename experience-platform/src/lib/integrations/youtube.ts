/**
 * YouTube API Integration
 * Provides video content, channel data, and live streaming functionality
 */

const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';

interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  publishedAt: string;
  channelId: string;
  channelTitle: string;
  viewCount: string;
  likeCount: string;
  duration: string;
}

interface YouTubeChannel {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  subscriberCount: string;
  videoCount: string;
  viewCount: string;
}

interface YouTubePlaylist {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  itemCount: number;
}

/**
 * Search for videos
 */
export async function searchVideos(query: string, maxResults = 10): Promise<YouTubeVideo[]> {
  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!apiKey) {
    throw new Error('YouTube API key not configured');
  }

  try {
    const response = await fetch(
      `${YOUTUBE_API_BASE}/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=${maxResults}&key=${apiKey}`
    );

    if (!response.ok) {
      throw new Error('YouTube search failed');
    }

    const data = await response.json();

    return data.items.map((item: any) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails.high.url,
      publishedAt: item.snippet.publishedAt,
      channelId: item.snippet.channelId,
      channelTitle: item.snippet.channelTitle,
      viewCount: '0',
      likeCount: '0',
      duration: '',
    }));
  } catch (error) {
    console.error('YouTube search error:', error);
    return [];
  }
}

/**
 * Get video details by ID
 */
export async function getVideoDetails(videoId: string): Promise<YouTubeVideo | null> {
  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!apiKey) {
    throw new Error('YouTube API key not configured');
  }

  try {
    const response = await fetch(
      `${YOUTUBE_API_BASE}/videos?part=snippet,statistics,contentDetails&id=${videoId}&key=${apiKey}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch video details');
    }

    const data = await response.json();
    const video = data.items[0];

    if (!video) {
      return null;
    }

    return {
      id: video.id,
      title: video.snippet.title,
      description: video.snippet.description,
      thumbnail: video.snippet.thumbnails.high.url,
      publishedAt: video.snippet.publishedAt,
      channelId: video.snippet.channelId,
      channelTitle: video.snippet.channelTitle,
      viewCount: video.statistics.viewCount,
      likeCount: video.statistics.likeCount,
      duration: video.contentDetails.duration,
    };
  } catch (error) {
    console.error('YouTube video details error:', error);
    return null;
  }
}

/**
 * Get channel details
 */
export async function getChannelDetails(channelId: string): Promise<YouTubeChannel | null> {
  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!apiKey) {
    throw new Error('YouTube API key not configured');
  }

  try {
    const response = await fetch(
      `${YOUTUBE_API_BASE}/channels?part=snippet,statistics&id=${channelId}&key=${apiKey}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch channel details');
    }

    const data = await response.json();
    const channel = data.items[0];

    if (!channel) {
      return null;
    }

    return {
      id: channel.id,
      title: channel.snippet.title,
      description: channel.snippet.description,
      thumbnail: channel.snippet.thumbnails.high.url,
      subscriberCount: channel.statistics.subscriberCount,
      videoCount: channel.statistics.videoCount,
      viewCount: channel.statistics.viewCount,
    };
  } catch (error) {
    console.error('YouTube channel details error:', error);
    return null;
  }
}

/**
 * Get videos from a channel
 */
export async function getChannelVideos(channelId: string, maxResults = 10): Promise<YouTubeVideo[]> {
  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!apiKey) {
    throw new Error('YouTube API key not configured');
  }

  try {
    const response = await fetch(
      `${YOUTUBE_API_BASE}/search?part=snippet&channelId=${channelId}&type=video&order=date&maxResults=${maxResults}&key=${apiKey}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch channel videos');
    }

    const data = await response.json();

    return data.items.map((item: any) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails.high.url,
      publishedAt: item.snippet.publishedAt,
      channelId: item.snippet.channelId,
      channelTitle: item.snippet.channelTitle,
      viewCount: '0',
      likeCount: '0',
      duration: '',
    }));
  } catch (error) {
    console.error('YouTube channel videos error:', error);
    return [];
  }
}

/**
 * Get playlist details
 */
export async function getPlaylistDetails(playlistId: string): Promise<YouTubePlaylist | null> {
  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!apiKey) {
    throw new Error('YouTube API key not configured');
  }

  try {
    const response = await fetch(
      `${YOUTUBE_API_BASE}/playlists?part=snippet,contentDetails&id=${playlistId}&key=${apiKey}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch playlist details');
    }

    const data = await response.json();
    const playlist = data.items[0];

    if (!playlist) {
      return null;
    }

    return {
      id: playlist.id,
      title: playlist.snippet.title,
      description: playlist.snippet.description,
      thumbnail: playlist.snippet.thumbnails.high.url,
      itemCount: playlist.contentDetails.itemCount,
    };
  } catch (error) {
    console.error('YouTube playlist details error:', error);
    return null;
  }
}

/**
 * Get videos from a playlist
 */
export async function getPlaylistVideos(playlistId: string, maxResults = 50): Promise<YouTubeVideo[]> {
  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!apiKey) {
    throw new Error('YouTube API key not configured');
  }

  try {
    const response = await fetch(
      `${YOUTUBE_API_BASE}/playlistItems?part=snippet&playlistId=${playlistId}&maxResults=${maxResults}&key=${apiKey}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch playlist videos');
    }

    const data = await response.json();

    return data.items.map((item: any) => ({
      id: item.snippet.resourceId.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails.high.url,
      publishedAt: item.snippet.publishedAt,
      channelId: item.snippet.channelId,
      channelTitle: item.snippet.channelTitle,
      viewCount: '0',
      likeCount: '0',
      duration: '',
    }));
  } catch (error) {
    console.error('YouTube playlist videos error:', error);
    return [];
  }
}

/**
 * Get live streams from a channel
 */
export async function getLiveStreams(channelId: string): Promise<YouTubeVideo[]> {
  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!apiKey) {
    throw new Error('YouTube API key not configured');
  }

  try {
    const response = await fetch(
      `${YOUTUBE_API_BASE}/search?part=snippet&channelId=${channelId}&type=video&eventType=live&key=${apiKey}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch live streams');
    }

    const data = await response.json();

    return data.items.map((item: any) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails.high.url,
      publishedAt: item.snippet.publishedAt,
      channelId: item.snippet.channelId,
      channelTitle: item.snippet.channelTitle,
      viewCount: '0',
      likeCount: '0',
      duration: 'LIVE',
    }));
  } catch (error) {
    console.error('YouTube live streams error:', error);
    return [];
  }
}

/**
 * Format YouTube duration (ISO 8601) to readable format
 */
export function formatDuration(duration: string): string {
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);

  if (!match) {
    return '0:00';
  }

  const hours = (match[1] || '').replace('H', '');
  const minutes = (match[2] || '').replace('M', '');
  const seconds = (match[3] || '').replace('S', '');

  if (hours) {
    return `${hours}:${minutes.padStart(2, '0')}:${seconds.padStart(2, '0')}`;
  }

  return `${minutes || '0'}:${seconds.padStart(2, '0')}`;
}
