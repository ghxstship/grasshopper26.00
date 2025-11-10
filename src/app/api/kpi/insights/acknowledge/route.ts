/**
 * KPI Insights Acknowledge API Route
 * POST /api/kpi/insights/acknowledge - Acknowledge an insight
 */

import { NextRequest, NextResponse } from 'next/server';
import { kpiAnalyticsService } from '@/lib/services/kpi-analytics.service';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { insight_id } = body;

    if (!insight_id) {
      return NextResponse.json(
        {
          success: false,
          error: 'insight_id is required',
        },
        { status: 400 }
      );
    }

    // Get current user
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
        },
        { status: 401 }
      );
    }

    await kpiAnalyticsService.acknowledgeInsight(insight_id, user.id);

    return NextResponse.json({
      success: true,
      message: 'Insight acknowledged successfully',
    });
  } catch (error) {
    console.error('KPI acknowledge insight API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to acknowledge insight',
      },
      { status: 500 }
    );
  }
}
