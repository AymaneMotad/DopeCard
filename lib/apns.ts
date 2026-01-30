/**
 * Apple Push Notification Service (APNS) Sender
 * 
 * Sends push notifications to Apple Wallet passes
 */

import apn from 'apn';

if (!process.env.APNS_KEY || !process.env.APNS_KEY_ID || !process.env.APPLE_TEAM_ID) {
  console.warn('APNS credentials not configured. Push notifications will not work.');
}

// Initialize APNS provider
let apns: apn.Provider | null = null;

if (process.env.APNS_KEY && process.env.APNS_KEY_ID && process.env.APPLE_TEAM_ID) {
  try {
    // Handle both formats: with \n escape sequences or actual newlines
    let keyContent = process.env.APNS_KEY;
    if (keyContent.includes('\\n')) {
      // Replace escaped newlines with actual newlines
      keyContent = keyContent.replace(/\\n/g, '\n');
    }

    apns = new apn.Provider({
      token: {
        key: keyContent,
        keyId: process.env.APNS_KEY_ID!,
        teamId: process.env.APPLE_TEAM_ID!,
      },
      production: process.env.NODE_ENV === 'production',
    });
    
    console.log('✅ APNS provider initialized successfully');
  } catch (error) {
    console.error('Failed to initialize APNS provider:', error);
  }
}

export interface APNSNotification {
  token: string;
  title: string;
  body: string;
  link?: string;
}

export async function sendAPNS({ token, title, body, link }: APNSNotification) {
  if (!apns) {
    throw new Error('APNS not configured. Please set APNS_KEY, APNS_KEY_ID, and APPLE_TEAM_ID environment variables.');
  }

  const note = new apn.Notification();

  // Set notification content
  note.alert = { title, body };
  note.topic = process.env.APNS_TOPIC || 'pass.com.dopecard.passmaker';
  note.sound = 'default';
  note.badge = 1;

  // Add link if provided
  if (link) {
    note.payload = { url: link };
  }

  // Send notification
  const result = await apns.send(note, token);

  if (result.failed && result.failed.length > 0) {
    const error = result.failed[0].response;
    throw new Error(`APNS error: ${error?.reason || 'Unknown error'}`);
  }

  return result;
}

