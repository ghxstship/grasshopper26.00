import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { handleAPIError, ErrorResponses } from '@/lib/api/error-handler';
import { requireAuth } from '@/lib/api/middleware';
import { rateLimit, RateLimitPresets } from '@/lib/api/rate-limiter';
import { changePasswordSchema } from '@/lib/validations/schemas';

// POST /api/auth/change-password - Change user password
export async function POST(req: NextRequest) {
  try {
    await rateLimit(req, RateLimitPresets.auth);
    const user = await requireAuth(req);

    const supabase = await createClient();

    // Parse and validate request body
    const body = await req.json();
    const { currentPassword, newPassword } = changePasswordSchema.parse(body);

    // Verify current password by attempting to sign in
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email!,
      password: currentPassword,
    });

    if (signInError) {
      throw ErrorResponses.badRequest('Current password is incorrect');
    }

    // Update password
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateError) {
      if (updateError.message.includes('same')) {
        throw ErrorResponses.badRequest('New password must be different from current password');
      }
      throw updateError;
    }

    // Create audit log entry
    await supabase
      .from('audit_logs')
      .insert({
        table_name: 'auth.users',
        record_id: user.id,
        action: 'UPDATE',
        changed_fields: ['password'],
        user_id: user.id,
        user_email: user.email,
        metadata: {
          action: 'password_change',
          timestamp: new Date().toISOString(),
        },
      });

    // Create notification
    await supabase
      .from('notifications')
      .insert({
        user_id: user.id,
        type: 'system_announcement',
        channel: 'email',
        title: 'Password Changed',
        message: 'Your password has been changed successfully. If you did not make this change, please contact support immediately.',
        metadata: {
          changed_at: new Date().toISOString(),
        },
      });

    return NextResponse.json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    return handleAPIError(error, req.url);
  }
}
