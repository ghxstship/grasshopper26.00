/**
 * Monitoring Metrics API
 * Provides access to application metrics for dashboards
 */

import { NextResponse } from 'next/server';
import { getQueryStats, getSlowQueries, getFailedQueries } from '@/lib/monitoring/database-monitor';
import { getSystemMetrics } from '@/lib/monitoring/uptime';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'all';

  try {
    let metrics: any = {};

    switch (type) {
      case 'database':
        metrics = {
          overall: getQueryStats(),
          slowQueries: getSlowQueries(5, 1000).slice(0, 10),
          failedQueries: getFailedQueries(5).slice(0, 10),
        };
        break;

      case 'system':
        metrics = getSystemMetrics();
        break;

      case 'all':
      default:
        metrics = {
          database: {
            overall: getQueryStats(),
            slowQueries: getSlowQueries(5, 1000).slice(0, 5),
            failedQueries: getFailedQueries(5).slice(0, 5),
          },
          system: getSystemMetrics(),
        };
        break;
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      metrics,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
