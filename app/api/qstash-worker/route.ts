/**
 * QStash Worker
 * 
 * This endpoint is called by QStash when a notification job is ready to process.
 * It sends push notifications to Apple Wallet (APNS) and Google Pay (FCM).
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifySignature } from "@upstash/qstash/nextjs";
import { db } from '@/db/drizzle';
import { passRegistrations } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { sendWalletPush } from '@/lib/apns';
import { sendFCM } from '@/lib/fcm';

export async function POST(req: NextRequest) {
  try {
    // Verify QStash signature for security
    if (process.env.QSTASH_CURRENT_SIGNING_KEY) {
      try {
        await verifySignature(req, {
          currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY,
          nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY,
        });
      } catch (error) {
        console.error('QStash signature verification failed:', error);
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 401 }
        );
      }
    }

    // Parse job payload
    const job = await req.json();
    const { userId, passId, title, body, link } = job;

    if (!userId || !passId || !title || !body) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Fetch device tokens for this pass
    const registrations = await db.query.passRegistrations.findMany({
      where: eq(passRegistrations.passId, passId),
    });

    if (registrations.length === 0) {
      // Return success even if no devices - this is not an error condition
      return NextResponse.json({
        success: true,
        devicesNotified: 0,
        message: 'No devices registered for this pass',
      });
    }

    // Send notifications to all registered devices
    const sendPromises = registrations.map(async (registration) => {
      try {
        if (registration.platform === 'ios') {
          // For Apple Wallet, send empty push (signals device to fetch updated pass)
          const result = await sendWalletPush(registration.pushToken);
          if (!result.success) {
            return { success: false, platform: 'ios', error: result.error };
          }
          return { success: true, platform: 'ios' };
        } else if (registration.platform === 'android') {
          // For Android/Google Pay, send FCM notification
          await sendFCM({
            token: registration.pushToken,
            title,
            body,
            link,
          });
          return { success: true, platform: 'android' };
        }
        return { success: false, platform: registration.platform, error: 'Unknown platform' };
      } catch (error) {
        console.error(`Failed to send notification to ${registration.platform} device:`, error);
        // Don't throw - continue with other devices
        return { success: false, platform: registration.platform, error: String(error) };
      }
    });

    const results = await Promise.all(sendPromises);
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    return NextResponse.json({
      success: true,
      devicesNotified: successful,
      devicesFailed: failed,
      totalDevices: registrations.length,
    });
  } catch (error) {
    console.error('QStash worker error:', error);
    // Return 500 to trigger QStash retry
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

