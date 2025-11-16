/**
 * Apple Wallet Get Updated Passes Endpoint
 * 
 * Returns list of passes that have been updated since last check
 * GET /v1/devices/{deviceLibraryIdentifier}/registrations/{passTypeIdentifier}
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/drizzle';
import { passRegistrations, userPasses, passUpdates } from '@/db/schema';
import { eq, and, gt } from 'drizzle-orm';
import { verifyAuthToken } from '../../middleware';

export async function GET(
  req: NextRequest,
  { params }: { params: { deviceLibraryIdentifier: string; passTypeIdentifier: string } }
) {
  // Verify authentication
  if (!verifyAuthToken(req)) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const { deviceLibraryIdentifier } = params;
    
    // Get last updated timestamp from query params
    const lastUpdated = req.nextUrl.searchParams.get('passesUpdatedSince');
    const lastUpdatedDate = lastUpdated ? new Date(lastUpdated) : new Date(0);

    // Find all registrations for this device
    const registrations = await db.query.passRegistrations.findMany({
      where: eq(passRegistrations.deviceLibraryIdentifier, deviceLibraryIdentifier),
      with: {
        // Note: Need to check if relations are set up in schema
      },
    });

    // Get passes that have been updated since last check
    const updatedPasses: string[] = [];

    for (const registration of registrations) {
      // Check if pass has updates since last check
      const updates = await db.query.passUpdates.findMany({
        where: and(
          eq(passUpdates.passId, registration.passId),
          gt(passUpdates.createdAt, lastUpdatedDate)
        ),
        orderBy: (passUpdates, { desc }) => [desc(passUpdates.createdAt)],
        limit: 1,
      });

      if (updates.length > 0) {
        const pass = await db.query.userPasses.findFirst({
          where: eq(userPasses.id, registration.passId),
        });

        if (pass) {
          updatedPasses.push(pass.serialNumber);
        }
      }
    }

    // Return list of updated serial numbers
    return NextResponse.json({
      lastUpdated: new Date().toISOString(),
      serialNumbers: updatedPasses,
    });
  } catch (error) {
    console.error('Get updated passes error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

