/**
 * Apple Wallet Log Endpoint
 * 
 * Receives error logs from Apple devices
 * POST /v1/log
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const logs = await req.text();
    
    // Log errors for debugging
    console.error('Apple Wallet Error Log:', logs);
    
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

