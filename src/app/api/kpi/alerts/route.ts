import { NextRequest, NextResponse } from 'next/server';
import { kpiAnalyticsService } from '@/lib/services/kpi-analytics.service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const metricId = searchParams.get('metric_id');
    const activeOnly = searchParams.get('active_only') === 'true';

    const alerts = await kpiAnalyticsService.getAlerts(metricId || undefined, activeOnly);

    return NextResponse.json({
      success: true,
      data: alerts,
      count: alerts.length,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch alerts',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const alertId = await kpiAnalyticsService.createAlert(body);

    return NextResponse.json({
      success: true,
      data: { id: alertId },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create alert',
      },
      { status: 500 }
    );
  }
}
