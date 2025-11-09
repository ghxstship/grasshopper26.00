import { NextResponse } from 'next/server';

/**
 * Liveness check - determines if the application is alive
 * Used to detect if application needs to be restarted
 */
export async function GET() {
  return NextResponse.json({ 
    alive: true,
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  }, { status: 200 });
}
