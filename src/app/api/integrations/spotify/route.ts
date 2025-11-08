import { NextRequest, NextResponse } from 'next/server';
import {
  searchSpotifyArtist,
  getArtistTopTracks,
  getArtistDetails,
  getRelatedArtists,
} from '@/lib/integrations/spotify';

/**
 * GET /api/integrations/spotify
 * Search for artists or get artist data
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action');
    const query = searchParams.get('q');
    const artistId = searchParams.get('artistId');
    const market = searchParams.get('market') || 'US';

    switch (action) {
      case 'search':
        if (!query) {
          return NextResponse.json(
            { error: 'Query parameter required' },
            { status: 400 }
          );
        }
        const artist = await searchSpotifyArtist(query);
        return NextResponse.json({ artist });

      case 'artist':
        if (!artistId) {
          return NextResponse.json(
            { error: 'Artist ID required' },
            { status: 400 }
          );
        }
        const details = await getArtistDetails(artistId);
        return NextResponse.json({ artist: details });

      case 'tracks':
        if (!artistId) {
          return NextResponse.json(
            { error: 'Artist ID required' },
            { status: 400 }
          );
        }
        const tracks = await getArtistTopTracks(artistId, market);
        return NextResponse.json({ tracks });

      case 'related':
        if (!artistId) {
          return NextResponse.json(
            { error: 'Artist ID required' },
            { status: 400 }
          );
        }
        const related = await getRelatedArtists(artistId);
        return NextResponse.json({ artists: related });

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: search, artist, tracks, or related' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Spotify API error:', error);
    return NextResponse.json(
      { error: 'Spotify integration failed' },
      { status: 500 }
    );
  }
}
