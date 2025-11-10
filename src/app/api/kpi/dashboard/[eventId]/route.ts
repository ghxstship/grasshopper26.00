/**
 * KPI Dashboard Data API Route
 * GET /api/kpi/dashboard/[eventId] - Get dashboard data for an event
 */

import { NextRequest, NextResponse } from 'next/server';
import { kpiAnalyticsService } from '@/lib/services/kpi-analytics.service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const { eventId } = await params;

    const data = await kpiAnalyticsService.getDashboardData({
      event_id: eventId,
      include_trends: true,
      include_targets: true,
    });

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('KPI dashboard API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch dashboard data',
      },
      { status: 500 }
    );
  }
}
