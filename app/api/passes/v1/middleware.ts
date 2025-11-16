/**
 * Apple Wallet Authentication Middleware
 * 
 * Verifies authentication token from Apple Wallet requests
 */

import { NextRequest, NextResponse } from 'next/server';

const AUTH_TOKEN = process.env.PASS_AUTH_TOKEN || 'default-token-change-in-production';

export function verifyAuthToken(req: NextRequest): boolean {
  const authHeader = req.headers.get('authorization');
  
  if (!authHeader) {
    return false;
  }

  // Apple sends: ApplePass {authenticationToken}
  const match = authHeader.match(/^ApplePass\s+(.+)$/);
  if (!match) {
    return false;
  }

  const token = match[1];
  return token === AUTH_TOKEN;
}

export function withAuth(handler: (req: NextRequest, context: any) => Promise<NextResponse>) {
  return async (req: NextRequest, context: any) => {
    if (!verifyAuthToken(req)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return handler(req, context);
  };
}

