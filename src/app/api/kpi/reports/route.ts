import { NextRequest, NextResponse } from 'next/server';
import { kpiAnalyticsService } from '@/lib/services/kpi-analytics.service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('event_id');

    const reports = await kpiAnalyticsService.getGeneratedReports(eventId || undefined);

    return NextResponse.json({
      success: true,
      data: reports,
      count: reports.length,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch reports',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const result = await kpiAnalyticsService.generateReport(body);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate report',
      },
      { status: 500 }
    );
  }
}
