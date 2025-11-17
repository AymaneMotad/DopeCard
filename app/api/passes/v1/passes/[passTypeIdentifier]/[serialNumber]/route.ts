/**
 * Apple Wallet Get Pass Endpoint
 * 
 * Returns the latest version of a pass
 * GET /v1/passes/{passTypeIdentifier}/{serialNumber}
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/drizzle';
import { userPasses } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { generatePass } from '@/app/utils/pass-generation/pass-generation';
import { verifyAuthToken } from '../../../middleware';

export async function GET(
  req: NextRequest,
  { params }: { params: { passTypeIdentifier: string; serialNumber: string } }
) {
  // Verify authentication
  if (!verifyAuthToken(req)) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const { serialNumber } = params;

    // Find the pass
    const pass = await db.query.userPasses.findFirst({
      where: eq(userPasses.serialNumber, serialNumber),
    });

    if (!pass) {
      return NextResponse.json(
        { error: 'Pass not found' },
        { status: 404 }
      );
    }

    // Extract userId from serial number (format: COFFEE{userId})
    const userId = serialNumber.replace('COFFEE', '');
    
    // Get current stamp count from metadata
    const stampCount = (pass.metadata as any)?.stampCount || 0;

    // Generate updated pass
    const passBuffer = await generatePass(userId, stampCount);

    // Return pass file
    return new NextResponse(passBuffer, {
      headers: {
        'Content-Type': 'application/vnd.apple.pkpass',
        'Content-Disposition': `attachment; filename="${serialNumber}.pkpass"`,
      },
    });
  } catch (error) {
    console.error('Get pass error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

