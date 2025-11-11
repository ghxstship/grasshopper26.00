/**
 * BlueSky OAuth Callback Handler
 * Handles the OAuth callback from BlueSky
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const error = requestUrl.searchParams.get('error');

  if (error) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_SITE_URL}/login?error=${encodeURIComponent(error)}`
    );
  }

  if (!code) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_SITE_URL}/login?error=no_code`
    );
  }

  try {
    const clientId = process.env.BLUESKY_CLIENT_ID;
    const clientSecret = process.env.BLUESKY_CLIENT_SECRET;
    const redirectUri = `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/bluesky/callback`;

    if (!clientId || !clientSecret) {
      throw new Error('BlueSky OAuth not configured');
    }

    // Exchange code for access token
    const tokenResponse = await fetch('https://bsky.social/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange code for token');
    }

    const { access_token } = await tokenResponse.json();

    // Get user profile from BlueSky
    const profileResponse = await fetch('https://bsky.social/xrpc/com.atproto.server.getSession', {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    if (!profileResponse.ok) {
      throw new Error('Failed to fetch user profile');
    }

    const profile = await profileResponse.json();

    // Create or update user in Supabase
    const supabase = await createClient();
    
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', profile.email)
      .single();

    if (existingUser) {
      // Update existing user
      await supabase
        .from('users')
        .update({
          bluesky_handle: profile.handle,
          bluesky_did: profile.did,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingUser.id);
    } else {
      // Create new user
      await supabase.from('users').insert({
        email: profile.email,
        display_name: profile.displayName || profile.handle,
        bluesky_handle: profile.handle,
        bluesky_did: profile.did,
      });
    }

    // Sign in with Supabase
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: profile.email,
      password: access_token, // Use access token as temporary password
    });

    if (signInError) {
      throw signInError;
    }

    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/portal`);
  } catch (error: any) {
    console.error('BlueSky callback error:', error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_SITE_URL}/login?error=${encodeURIComponent(error.message)}`
    );
  }
}
