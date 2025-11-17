/**
 * Apple Wallet Pass Registration Endpoint
 * 
 * Handles device registration for pass updates
 * POST /v1/devices/{deviceLibraryIdentifier}/registrations/{passTypeIdentifier}/{serialNumber}
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/drizzle';
import { passRegistrations, userPasses } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { verifyAuthToken } from '../../../../middleware';

export async function POST(
  req: NextRequest,
  { params }: { params: { deviceLibraryIdentifier: string; passTypeIdentifier: string; serialNumber: string } }
) {
  // Verify authentication
  if (!verifyAuthToken(req)) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const { deviceLibraryIdentifier, serialNumber } = params;
    
    // Get push token from request body
    const body = await req.text();
    const pushToken = body || '';

    if (!pushToken) {
      return NextResponse.json(
        { error: 'Push token required' },
        { status: 400 }
      );
    }

    // Find the pass by serial number
    // Serial number format: COFFEE{userId}
    const pass = await db.query.userPasses.findFirst({
      where: eq(userPasses.serialNumber, serialNumber),
    });

    if (!pass) {
      return NextResponse.json(
        { error: 'Pass not found' },
        { status: 404 }
      );
    }

    // Check if registration already exists
    const existingRegistration = await db.query.passRegistrations.findFirst({
      where: and(
        eq(passRegistrations.passId, pass.id),
        eq(passRegistrations.deviceLibraryIdentifier, deviceLibraryIdentifier)
      ),
    });

    if (existingRegistration) {
      // Update existing registration
      await db.update(passRegistrations)
        .set({
          pushToken,
          updatedAt: new Date(),
        })
        .where(eq(passRegistrations.id, existingRegistration.id));

      return NextResponse.json({}, { status: 200 });
    }

    // Create new registration
    await db.insert(passRegistrations).values({
      passId: pass.id,
      pushToken,
      deviceLibraryIdentifier,
      platform: 'ios',
    });

    return NextResponse.json({}, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { deviceLibraryIdentifier: string; passTypeIdentifier: string; serialNumber: string } }
) {
  // Verify authentication
  if (!verifyAuthToken(req)) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const { deviceLibraryIdentifier, serialNumber } = params;

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

    // Delete registration
    await db.delete(passRegistrations)
      .where(
        and(
          eq(passRegistrations.passId, pass.id),
          eq(passRegistrations.deviceLibraryIdentifier, deviceLibraryIdentifier)
        )
      );

    return NextResponse.json({}, { status: 200 });
  } catch (error) {
    console.error('Unregistration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

