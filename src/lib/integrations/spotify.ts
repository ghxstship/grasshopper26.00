/**
 * Spotify API Integration
 * Provides artist data, top tracks, and music player functionality
 */

const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';
const SPOTIFY_ACCOUNTS_BASE = 'https://accounts.spotify.com';

interface SpotifyTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface SpotifyArtist {
  id: string;
  name: string;
  genres: string[];
  popularity: number;
  images: Array<{
    url: string;
    height: number;
    width: number;
  }>;
  external_urls: {
    spotify: string;
  };
}

interface SpotifyTrack {
  id: string;
  name: string;
  preview_url: string | null;
  duration_ms: number;
  external_urls: {
    spotify: string;
  };
  album: {
    name: string;
    images: Array<{
      url: string;
      height: number;
      width: number;
    }>;
  };
}

/**
 * Get Spotify access token using Client Credentials flow
 */
async function getAccessToken(): Promise<string> {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('Spotify credentials not configured');
  }

  const response = await fetch(`${SPOTIFY_ACCOUNTS_BASE}/api/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
    },
    body: 'grant_type=client_credentials',
  });

  if (!response.ok) {
    throw new Error('Failed to get Spotify access token');
  }

  const data: SpotifyTokenResponse = await response.json();
  return data.access_token;
}

/**
 * Search for an artist on Spotify
 */
export async function searchSpotifyArtist(artistName: string): Promise<SpotifyArtist | null> {
  try {
    const token = await getAccessToken();

    const response = await fetch(
      `${SPOTIFY_API_BASE}/search?q=${encodeURIComponent(artistName)}&type=artist&limit=1`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Spotify search failed');
    }

    const data = await response.json();
    return data.artists.items[0] || null;
  } catch (error) {
    console.error('Spotify artist search error:', error);
    return null;
  }
}

/**
 * Get artist's top tracks
 */
export async function getArtistTopTracks(spotifyArtistId: string, market = 'US'): Promise<SpotifyTrack[]> {
  try {
    const token = await getAccessToken();

    const response = await fetch(
      `${SPOTIFY_API_BASE}/artists/${spotifyArtistId}/top-tracks?market=${market}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch top tracks');
    }

    const data = await response.json();
    return data.tracks || [];
  } catch (error) {
    console.error('Spotify top tracks error:', error);
    return [];
  }
}

/**
 * Get artist details
 */
export async function getArtistDetails(spotifyArtistId: string): Promise<SpotifyArtist | null> {
  try {
    const token = await getAccessToken();

    const response = await fetch(`${SPOTIFY_API_BASE}/artists/${spotifyArtistId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch artist details');
    }

    return await response.json();
  } catch (error) {
    console.error('Spotify artist details error:', error);
    return null;
  }
}

/**
 * Get multiple artists' details
 */
export async function getMultipleArtists(spotifyArtistIds: string[]): Promise<SpotifyArtist[]> {
  try {
    const token = await getAccessToken();

    const response = await fetch(
      `${SPOTIFY_API_BASE}/artists?ids=${spotifyArtistIds.join(',')}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch artists');
    }

    const data = await response.json();
    return data.artists || [];
  } catch (error) {
    console.error('Spotify multiple artists error:', error);
    return [];
  }
}

/**
 * Create a Spotify playlist (requires user OAuth - for future implementation)
 */
export async function createPlaylist(
  userId: string,
  name: string,
  trackUris: string[],
  accessToken: string
): Promise<string | null> {
  try {
    // Create playlist
    const createResponse = await fetch(`${SPOTIFY_API_BASE}/users/${userId}/playlists`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        description: 'Created by Grasshopper',
        public: false,
      }),
    });

    if (!createResponse.ok) {
      throw new Error('Failed to create playlist');
    }

    const playlist = await createResponse.json();

    // Add tracks to playlist
    if (trackUris.length > 0) {
      await fetch(`${SPOTIFY_API_BASE}/playlists/${playlist.id}/tracks`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uris: trackUris,
        }),
      });
    }

    return playlist.id;
  } catch (error) {
    console.error('Spotify playlist creation error:', error);
    return null;
  }
}

/**
 * Get artist's related artists
 */
export async function getRelatedArtists(spotifyArtistId: string): Promise<SpotifyArtist[]> {
  try {
    const token = await getAccessToken();

    const response = await fetch(
      `${SPOTIFY_API_BASE}/artists/${spotifyArtistId}/related-artists`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch related artists');
    }

    const data = await response.json();
    return data.artists || [];
  } catch (error) {
    console.error('Spotify related artists error:', error);
    return [];
  }
}
