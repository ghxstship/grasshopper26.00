import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { handleAPIError, ErrorResponses } from '@/lib/api/error-handler';
import { rateLimit, RateLimitPresets } from '@/lib/api/rate-limiter';
import { z } from 'zod';

const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Verification token is required'),
  type: z.enum(['signup', 'email_change']).default('signup'),
});

// POST /api/auth/verify-email - Verify email address
export async function POST(req: NextRequest) {
  try {
    await rateLimit(req, RateLimitPresets.auth);

    const supabase = await createClient();

    // Parse and validate request body
    const body = await req.json();
    const { token, type } = verifyEmailSchema.parse(body);

    // Verify the email token
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash: token,
      type: type === 'signup' ? 'signup' : 'email_change',
    });

    if (error) {
      if (error.message.includes('expired')) {
        throw ErrorResponses.badRequest('Verification link has expired. Please request a new one.');
      }
      if (error.message.includes('invalid')) {
        throw ErrorResponses.badRequest('Invalid verification link.');
      }
      throw error;
    }

    if (!data.user) {
      throw ErrorResponses.badRequest('Email verification failed');
    }

    // Update user metadata to mark email as verified
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      data.user.id,
      {
        email_confirm: true,
        user_metadata: {
          ...data.user.user_metadata,
          email_verified: true,
          email_verified_at: new Date().toISOString(),
        },
      }
    );

    if (updateError) {
      console.error('Failed to update user metadata:', updateError);
    }

    // Create or update user profile
    const { error: profileError } = await supabase
      .from('user_profiles')
      .upsert({
        user_id: data.user.id,
        display_name: data.user.user_metadata?.name || data.user.email?.split('@')[0],
        updated_at: new Date().toISOString(),
      });

    if (profileError) {
      console.error('Failed to create/update user profile:', profileError);
    }

    // Create notification preferences
    const { error: prefsError } = await supabase
      .from('notification_preferences')
      .upsert({
        user_id: data.user.id,
        email_enabled: true,
        push_enabled: true,
        order_confirmation_email: true,
        order_confirmation_push: true,
        event_reminder_email: true,
        event_reminder_push: true,
        updated_at: new Date().toISOString(),
      });

    if (prefsError) {
      console.error('Failed to create notification preferences:', prefsError);
    }

    // Create welcome notification
    await supabase
      .from('notifications')
      .insert({
        user_id: data.user.id,
        type: 'system_announcement',
        channel: 'in_app',
        title: 'Welcome!',
        message: 'Your email has been verified. Welcome to the platform!',
        metadata: {
          verified_at: new Date().toISOString(),
        },
      });

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully',
      data: {
        userId: data.user.id,
        email: data.user.email,
        emailVerified: true,
      },
    });
  } catch (error) {
    return handleAPIError(error, req.url);
  }
}

// GET /api/auth/verify-email - Resend verification email
export async function GET(req: NextRequest) {
  try {
    await rateLimit(req, RateLimitPresets.auth);

    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      throw ErrorResponses.unauthorized();
    }

    // Check if email is already verified
    if (user.email_confirmed_at) {
      return NextResponse.json({
        success: true,
        message: 'Email is already verified',
        data: {
          emailVerified: true,
        },
      });
    }

    // Resend verification email
    const { error: resendError } = await supabase.auth.resend({
      type: 'signup',
      email: user.email!,
    });

    if (resendError) {
      throw resendError;
    }

    return NextResponse.json({
      success: true,
      message: 'Verification email sent successfully',
      data: {
        email: user.email,
        sentAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    return handleAPIError(error, req.url);
  }
}
