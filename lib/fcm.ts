/**
 * Firebase Cloud Messaging (FCM) Sender
 * 
 * Sends push notifications to Google Pay passes
 */

import admin from 'firebase-admin';

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  if (process.env.FCM_CREDENTIALS) {
    try {
      const credentials = JSON.parse(process.env.FCM_CREDENTIALS);
      admin.initializeApp({
        credential: admin.credential.cert(credentials),
      });
      console.log('✅ FCM provider initialized successfully');
      console.log(`   Project ID: ${credentials.project_id}`);
    } catch (error) {
      console.error('Failed to initialize Firebase Admin:', error);
    }
  } else {
    console.warn('FCM credentials not configured. Push notifications will not work.');
  }
}

export interface FCMNotification {
  token: string;
  title: string;
  body: string;
  link?: string;
}

export async function sendFCM({ token, title, body, link }: FCMNotification) {
  if (!admin.apps.length) {
    throw new Error('FCM not configured. Please set FCM_CREDENTIALS environment variable.');
  }

  const message = {
    token,
    notification: {
      title,
      body,
    },
    data: link ? { url: link } : undefined,
    android: {
      priority: 'high' as const,
      notification: {
        sound: 'default',
        channelId: 'loyalty_card_notifications',
      },
    },
    apns: {
      payload: {
        aps: {
          sound: 'default',
          badge: 1,
        },
      },
    },
  };

  try {
    const response = await admin.messaging().send(message);
    return response;
  } catch (error: any) {
    // Handle specific FCM errors
    if (error.code === 'messaging/invalid-registration-token') {
      // Token is invalid - should be removed from database
      console.warn('Invalid FCM token:', token);
    }
    throw error;
  }
}

