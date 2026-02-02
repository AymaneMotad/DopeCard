/**
 * Apple Wallet Log Endpoint
 * 
 * Receives error logs from Apple devices
 * POST /v1/log
 */

import { NextRequest, NextResponse } from 'next/server';

// Force Node.js runtime (not Edge) - required for Apple Wallet
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  console.log('═════════════════════════════════════════════════════');
  console.log('📋 APPLE WALLET LOG RECEIVED');
  console.log('═════════════════════════════════════════════════════');
  try {
    const logs = await req.text();
    
    // Log errors for debugging
    console.log('📋 Log content:', logs);
    console.log('═════════════════════════════════════════════════════');
    
    // You can also save logs to database or logging service here
    
    return NextResponse.json({}, { status: 200 });
  } catch (error) {
    console.error('Log endpoint error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

