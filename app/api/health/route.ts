import { NextResponse } from 'next/server';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Health check endpoint for Railway and monitoring
 * Returns 200 OK if the application is running
 */
export async function GET() {
  console.log('[HEALTH CHECK] Endpoint called');
  return NextResponse.json({ status: 'ok' }, { status: 200 });
}
