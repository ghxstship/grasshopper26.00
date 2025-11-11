/**
 * BlueSky OAuth Handler
 * Initiates BlueSky authentication flow
 */

import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    // BlueSky OAuth configuration
    const clientId = process.env.BLUESKY_CLIENT_ID;
    const redirectUri = `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/bluesky/callback`;
    
    if (!clientId) {
      throw new Error('BlueSky OAuth not configured');
    }

    // Build BlueSky OAuth URL
    const authUrl = new URL('https://bsky.social/oauth/authorize');
    authUrl.searchParams.set('client_id', clientId);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('scope', 'profile email');
    authUrl.searchParams.set('state', crypto.randomUUID());

    return NextResponse.redirect(authUrl.toString());
  } catch (error: any) {
    console.error('BlueSky OAuth error:', error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_SITE_URL}/login?error=${encodeURIComponent(error.message)}`
    );
  }
}
