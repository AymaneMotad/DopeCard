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
import { verifyAuthToken } from '@/app/api/passes/v1/middleware';

export async function POST(
  req: NextRequest,
  { params }: { params: { deviceLibraryIdentifier: string; passTypeIdentifier: string; serialNumber: string } }
) {
  console.log('═════════════════════════════════════════════════════');
  console.log('📱 APPLE WALLET REGISTRATION REQUEST');
  console.log('═════════════════════════════════════════════════════');
  console.log('📍 Endpoint: POST /api/passes/v1/devices/{deviceId}/registrations/{passType}/{serialNumber}');
  console.log('🆔 Device ID:', params.deviceLibraryIdentifier);
  console.log('🔖 Pass Type:', params.passTypeIdentifier);
  console.log('🎫 Serial Number:', params.serialNumber);
  console.log('🔐 Authorization Header:', req.headers.get('authorization') ? 'Present' : 'MISSING');
  console.log('═════════════════════════════════════════════════════');
  
  // Verify authentication
  if (!verifyAuthToken(req)) {
    console.error('❌ AUTHENTICATION FAILED');
    console.error('Expected: ApplePass ' + (process.env.PASS_AUTH_TOKEN || 'NOT_SET'));
    console.error('Received:', req.headers.get('authorization') || 'NO_AUTH_HEADER');
    console.log('═════════════════════════════════════════════════════');
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
  console.log('✅ Authentication verified');

  try {
    const { deviceLibraryIdentifier, serialNumber } = params;
    
    // Get push token from request body
    const body = await req.text();
    const pushToken = body || '';
    console.log('🔑 Push Token Length:', pushToken.length);

    if (!pushToken) {
      console.error('❌ Push token missing in request body');
      console.log('═════════════════════════════════════════════════════');
      return NextResponse.json(
        { error: 'Push token required' },
        { status: 400 }
      );
    }

    // Find the pass by serial number
    console.log('🔍 Searching for pass in database...');
    console.log('   Serial Number:', serialNumber);
    const pass = await db.query.userPasses.findFirst({
      where: eq(userPasses.serialNumber, serialNumber),
    });

    if (!pass) {
      console.error('❌ PASS NOT FOUND IN DATABASE');
      console.error('   Serial Number:', serialNumber);
      console.error('💡 This means the pass was not created in the database');
      console.error('💡 Check if generateTestPass creates the userPasses record');
      console.log('═════════════════════════════════════════════════════');
      return NextResponse.json(
        { error: 'Pass not found' },
        { status: 404 }
      );
    }

    console.log('✅ Pass found in database');
    console.log('   Pass ID:', pass.id);
    console.log('   Serial Number:', pass.serialNumber);
    console.log('   User ID:', pass.userId);
    console.log('   Status:', pass.status);

    // Check if registration already exists
    console.log('🔍 Checking for existing registration...');
    const existingRegistration = await db.query.passRegistrations.findFirst({
      where: and(
        eq(passRegistrations.passId, pass.id),
        eq(passRegistrations.deviceLibraryIdentifier, deviceLibraryIdentifier)
      ),
    });

    if (existingRegistration) {
      console.log('📝 Updating existing registration');
      console.log('   Registration ID:', existingRegistration.id);
      console.log('   Old Push Token Length:', existingRegistration.pushToken.length);
      console.log('   New Push Token Length:', pushToken.length);
      
      // Update existing registration
      await db.update(passRegistrations)
        .set({
          pushToken,
          updatedAt: new Date(),
        })
        .where(eq(passRegistrations.id, existingRegistration.id));

      console.log('✅ Registration updated successfully');
      console.log('═════════════════════════════════════════════════════');
      return NextResponse.json({}, { status: 200 });
    }

    // Create new registration
    console.log('✨ Creating NEW registration');
    console.log('   Pass ID:', pass.id);
    console.log('   Device ID:', deviceLibraryIdentifier);
    console.log('   Push Token Length:', pushToken.length);
    console.log('   Platform: ios');
    
    await db.insert(passRegistrations).values({
      passId: pass.id,
      pushToken,
      deviceLibraryIdentifier,
      platform: 'ios',
    });

    // Verify registration was created
    console.log('🔍 Verifying registration was created...');
    const verifyRegistration = await db.query.passRegistrations.findFirst({
      where: and(
        eq(passRegistrations.passId, pass.id),
        eq(passRegistrations.deviceLibraryIdentifier, deviceLibraryIdentifier)
      ),
    });

    if (verifyRegistration) {
      console.log('✅ ✅ ✅ REGISTRATION SUCCESSFUL ✅ ✅ ✅');
      console.log('   Registration ID:', verifyRegistration.id);
      console.log('   Pass ID:', verifyRegistration.passId);
      console.log('   Device ID:', verifyRegistration.deviceLibraryIdentifier);
      console.log('   Platform:', verifyRegistration.platform);
      console.log('   Created At:', verifyRegistration.createdAt);
      console.log('📱 Device is now registered for push notifications!');
      console.log('═════════════════════════════════════════════════════');
    } else {
      console.error('❌ ❌ ❌ REGISTRATION FAILED ❌ ❌ ❌');
      console.error('   Insert appeared to succeed but record not found');
      console.error('   This is a database consistency issue');
      console.log('═════════════════════════════════════════════════════');
    }

    return NextResponse.json({}, { status: 201 });
  } catch (error) {
    console.error('❌ ❌ ❌ REGISTRATION ERROR ❌ ❌ ❌');
    console.error('Error:', error);
    console.error('Stack:', error instanceof Error ? error.stack : 'No stack trace');
    console.log('═════════════════════════════════════════════════════');
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

