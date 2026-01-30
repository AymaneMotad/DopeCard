/**
 * Debug Endpoint - Pass Records
 * 
 * GET /api/debug/passes?serialNumber=COFFEE{uuid}
 * GET /api/debug/passes?userId={uuid}
 * GET /api/debug/passes (lists all recent passes)
 * 
 * ONLY USE IN DEVELOPMENT - Remove before production
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/drizzle';
import { userPasses, passRegistrations, users } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  // SECURITY: Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Debug endpoint disabled in production' },
      { status: 403 }
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const serialNumber = searchParams.get('serialNumber');
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '10');

    let passes;
    let passInfo = [];

    if (serialNumber) {
      // Find specific pass by serial number
      const pass = await db.query.userPasses.findFirst({
        where: eq(userPasses.serialNumber, serialNumber),
        with: {
          // This will automatically join if relations are set up in schema
        }
      });

      if (!pass) {
        return NextResponse.json({
          error: 'Pass not found',
          serialNumber,
          hint: 'Check if pass was created in database when generating test pass'
        }, { status: 404 });
      }

      // Get user info
      const user = await db.query.users.findFirst({
        where: eq(users.id, pass.userId),
      });

      // Get registrations
      const registrations = await db.query.passRegistrations.findMany({
        where: eq(passRegistrations.passId, pass.id),
      });

      return NextResponse.json({
        pass: {
          id: pass.id,
          userId: pass.userId,
          serialNumber: pass.serialNumber,
          status: pass.status,
          templateId: pass.templateId,
          metadata: pass.metadata,
          createdAt: pass.createdAt,
          updatedAt: pass.updatedAt,
        },
        user: user ? {
          id: user.id,
          username: user.username,
          email: user.email,
          phoneNumber: user.phoneNumber,
          role: user.role,
        } : null,
        registrations: registrations.map(reg => ({
          id: reg.id,
          deviceLibraryIdentifier: reg.deviceLibraryIdentifier,
          platform: reg.platform,
          pushToken: reg.pushToken ? `${reg.pushToken.substring(0, 20)}...` : null,
          createdAt: reg.createdAt,
          updatedAt: reg.updatedAt,
        })),
        deviceCount: registrations.length,
      });
    } else if (userId) {
      // Find all passes for user
      passes = await db.query.userPasses.findMany({
        where: eq(userPasses.userId, userId),
        orderBy: [desc(userPasses.createdAt)],
      });
    } else {
      // List recent passes
      passes = await db.query.userPasses.findMany({
        orderBy: [desc(userPasses.createdAt)],
        limit: limit,
      });
    }

    // Get details for each pass
    for (const pass of passes) {
      const user = await db.query.users.findFirst({
        where: eq(users.id, pass.userId),
      });

      const registrations = await db.query.passRegistrations.findMany({
        where: eq(passRegistrations.passId, pass.id),
      });

      passInfo.push({
        pass: {
          id: pass.id,
          userId: pass.userId,
          serialNumber: pass.serialNumber,
          status: pass.status,
          metadata: pass.metadata,
          createdAt: pass.createdAt,
        },
        user: user ? {
          username: user.username,
          email: user.email,
        } : null,
        deviceCount: registrations.length,
      });
    }

    return NextResponse.json({
      passes: passInfo,
      total: passInfo.length,
      limit: limit,
    });
  } catch (error) {
    console.error('Debug endpoint error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}


