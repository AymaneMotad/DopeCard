/**
 * Apple Wallet Get Updated Passes Endpoint
 * 
 * Returns list of passes that have been updated since last check
 * GET /v1/devices/{deviceLibraryIdentifier}/registrations/{passTypeIdentifier}
 * 
 * NOTE: This endpoint does NOT require authentication per Apple's spec.
 * Apple does not send Authorization header for this endpoint.
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/drizzle';
import { passRegistrations, userPasses, passUpdates } from '@/db/schema';
import { eq, and, gt } from 'drizzle-orm';

// Force Node.js runtime (not Edge) - required for Apple Wallet
export const runtime = "nodejs";

export async function GET(
  req: NextRequest,
  { params }: { params: { deviceLibraryIdentifier: string; passTypeIdentifier: string } }
) {
  // NOTE: No authentication required for this endpoint per Apple's PassKit Web Service spec
  // Apple only sends Authorization header for registration, pass download, and log endpoints
  
  console.log('═════════════════════════════════════════════════════');
  console.log('📱 APPLE WALLET - GET UPDATED PASSES');
  console.log('═════════════════════════════════════════════════════');
  console.log('🆔 Device ID:', params.deviceLibraryIdentifier);
  console.log('🔖 Pass Type:', params.passTypeIdentifier);
  console.log('📅 passesUpdatedSince:', req.nextUrl.searchParams.get('passesUpdatedSince'));
  console.log('═════════════════════════════════════════════════════');

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

    console.log('📋 Found registrations:', registrations.length);
    console.log('📋 Updated passes to return:', updatedPasses);

    // If no updated passes, return 204 No Content (per Apple spec)
    if (updatedPasses.length === 0) {
      console.log('✅ No updates - returning 204 No Content');
      return new NextResponse(null, { status: 204 });
    }

    // Return list of updated serial numbers
    const response = {
      lastUpdated: new Date().toISOString(),
      serialNumbers: updatedPasses,
    };
    console.log('✅ Returning updated passes:', response);
    return NextResponse.json(response);
  } catch (error) {
    console.error('❌ Get updated passes error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

