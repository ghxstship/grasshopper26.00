import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // Provide specific error messages
      let errorMessage = error.message;
      
      if (error.message.includes('Invalid login credentials')) {
        errorMessage = 'Invalid email or password. Please try again.';
      } else if (error.message.includes('Email not confirmed')) {
        errorMessage = 'Please verify your email address before logging in.';
      } else if (error.message.includes('User not found')) {
        errorMessage = 'No account found with this email address.';
      }

      return NextResponse.json(
        { 
          error: errorMessage,
          code: error.status || 401,
          needsVerification: error.message.includes('Email not confirmed')
        },
        { status: 401 }
      );
    }

    if (!data.user) {
      return NextResponse.json(
        { error: 'Login failed. Please try again.' },
        { status: 401 }
      );
    }

    // Check if user profile exists, create if not
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('id, username, display_name')
      .eq('id', data.user.id)
      .single();

    if (!profile && !profileError) {
      const { error: insertError } = await supabase.from('user_profiles').insert({
        id: data.user.id,
        username: email.split('@')[0],
        display_name: data.user.user_metadata?.name || email.split('@')[0],
        notification_preferences: {
          email_marketing: true,
          email_events: true,
          email_orders: true,
        },
      });

      if (insertError) {
        console.error('Profile creation error:', insertError);
      }
    }

    return NextResponse.json({
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata?.name || profile?.display_name,
        username: profile?.username,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { 
        error: 'An unexpected error occurred. Please try again later.',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}
