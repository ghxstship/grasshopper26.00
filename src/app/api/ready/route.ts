import { NextResponse } from 'next/server';

/**
 * Readiness check - determines if the application is ready to receive traffic
 * Used by load balancers to determine if instance should receive requests
 */
export async function GET() {
  const isReady = await checkReadiness();
  
  if (isReady) {
    return NextResponse.json({ 
      ready: true,
      timestamp: new Date().toISOString()
    }, { status: 200 });
  }
  
  return NextResponse.json({ 
    ready: false,
    timestamp: new Date().toISOString()
  }, { status: 503 });
}

async function checkReadiness(): Promise<boolean> {
  const checks = [
    checkEnvironmentVariables(),
    await checkDatabaseConnection()
  ];
  
  return checks.every(result => result === true);
}

function checkEnvironmentVariables(): boolean {
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'STRIPE_SECRET_KEY',
    'STRIPE_PUBLISHABLE_KEY'
  ];
  
  return required.every(key => !!process.env[key]);
}

async function checkDatabaseConnection(): Promise<boolean> {
  try {
    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();
    const { error } = await supabase.from('users').select('count').limit(1);
    return !error;
  } catch {
    return false;
  }
}
