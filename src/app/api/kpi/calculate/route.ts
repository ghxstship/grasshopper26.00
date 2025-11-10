/**
 * KPI Calculate API Route
 * POST /api/kpi/calculate - Calculate KPIs for an event
 */

import { NextRequest, NextResponse } from 'next/server';
import { kpiAnalyticsService } from '@/lib/services/kpi-analytics.service';
import type { CalculateKPIRequest } from '@/types/kpi';

export async function POST(request: NextRequest) {
  try {
    const body: CalculateKPIRequest = await request.json();

    if (!body.event_id) {
      return NextResponse.json(
        {
          success: false,
          error: 'event_id is required',
        },
        { status: 400 }
      );
    }

    const result = await kpiAnalyticsService.calculateKPIs(body);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.errors?.join(', ') || 'Calculation failed',
        },
        { status: 500 }
      );
    }

    // Refresh materialized views after calculation
    await kpiAnalyticsService.refreshViews();

    return NextResponse.json({
      success: true,
      data: result.data,
      count: result.data.length,
    });
  } catch (error) {
    console.error('KPI calculate API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Calculation failed',
      },
      { status: 500 }
    );
  }
}
