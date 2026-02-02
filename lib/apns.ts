/**
 * Apple Push Notification Service (APNS) Sender
 * 
 * Two types of notifications:
 * 1. sendWalletPush - For Apple Wallet passes (empty push, signals device to fetch updates)
 * 2. sendAPNS - For regular app notifications (with title/body)
 */

import apn from 'apn';

if (!process.env.APNS_KEY || !process.env.APNS_KEY_ID || !process.env.APPLE_TEAM_ID) {
  console.warn('APNS credentials not configured. Push notifications will not work.');
}

// Get the APNS key content (handle escaped newlines)
function getKeyContent(): string | null {
  if (!process.env.APNS_KEY) return null;
  let keyContent = process.env.APNS_KEY;
  if (keyContent.includes('\\n')) {
    keyContent = keyContent.replace(/\\n/g, '\n');
  }
  return keyContent;
}

// Initialize APNS providers for both sandbox and production
// Wallet passes may register with either environment depending on how they're installed
let apnsSandbox: apn.Provider | null = null;
let apnsProduction: apn.Provider | null = null;

const keyContent = getKeyContent();
if (keyContent && process.env.APNS_KEY_ID && process.env.APPLE_TEAM_ID) {
  try {
    // Sandbox provider (for development)
    apnsSandbox = new apn.Provider({
      token: {
        key: keyContent,
        keyId: process.env.APNS_KEY_ID!,
        teamId: process.env.APPLE_TEAM_ID!,
      },
      production: false,
    });
    
    // Production provider (for production or some Wallet passes)
    apnsProduction = new apn.Provider({
      token: {
        key: keyContent,
        keyId: process.env.APNS_KEY_ID!,
        teamId: process.env.APPLE_TEAM_ID!,
      },
      production: true,
    });
    
    console.log('✅ APNS provider initialized successfully (sandbox + production)');
  } catch (error) {
    console.error('Failed to initialize APNS provider:', error);
  }
}

/**
 * Send Apple Wallet Pass Update Push
 * 
 * Per Apple's PassKit Web Service Reference:
 * - Must be an EMPTY push notification (no alert, no badge, no sound)
 * - Topic must be the pass type identifier
 * - This signals the device to call your web service to fetch the updated pass
 * 
 * Note: Wallet passes may register with sandbox OR production APNS depending on
 * how they're installed. We try sandbox first, then production if that fails.
 * 
 * @see https://developer.apple.com/documentation/walletpasses/adding-a-web-service-to-update-passes
 */
export async function sendWalletPush(pushToken: string): Promise<{ success: boolean; error?: string; environment?: string }> {
  if (!apnsSandbox || !apnsProduction) {
    throw new Error('APNS not configured. Please set APNS_KEY, APNS_KEY_ID, and APPLE_TEAM_ID environment variables.');
  }

  // Create notification for Wallet passes
  const createNote = () => {
    const note = new apn.Notification();
    // Apple Wallet requires an EMPTY push notification
    // The push just signals "check for updates" - no content
    note.topic = process.env.APNS_TOPIC || 'pass.com.dopecard.passmaker';
    note.payload = {}; // Empty payload required
    note.pushType = 'background'; // Silent background push
    // Important: Do NOT set alert, badge, or sound for Wallet passes
    return note;
  };

  console.log('═════════════════════════════════════════════════════');
  console.log('📱 SENDING APPLE WALLET PUSH');
  console.log('═════════════════════════════════════════════════════');
  console.log('🔑 Push Token:', pushToken.substring(0, 20) + '...');
  console.log('🔑 Full Token Length:', pushToken.length);
  console.log('📍 Topic:', process.env.APNS_TOPIC || 'pass.com.dopecard.passmaker');
  console.log('🔄 Push Type: background (empty push for Wallet)');
  console.log('═════════════════════════════════════════════════════');

  // Try SANDBOX first (most common for development)
  console.log('🌍 Trying SANDBOX environment...');
  try {
    const note = createNote();
    const result = await apnsSandbox.send(note, pushToken);

    if (result.sent && result.sent.length > 0) {
      console.log('✅ Wallet push sent successfully via SANDBOX!');
      console.log('   Device will now call GET /v1/devices/.../registrations/... to check for updates');
      return { success: true, environment: 'sandbox' };
    }

    if (result.failed && result.failed.length > 0) {
      const error = result.failed[0].response;
      console.log('⚠️ Sandbox failed:', error?.reason || 'Unknown error');
      
      // If BadDeviceToken, try production
      if (error?.reason === 'BadDeviceToken') {
        console.log('🌍 Token might be for PRODUCTION, trying production environment...');
      } else {
        // Other error, don't retry
        console.error('❌ Wallet push failed:', error?.reason);
        return { success: false, error: error?.reason || 'Unknown error', environment: 'sandbox' };
      }
    }
  } catch (error) {
    console.error('⚠️ Sandbox attempt threw error:', error);
  }

  // Try PRODUCTION as fallback
  console.log('🌍 Trying PRODUCTION environment...');
  try {
    const note = createNote();
    const result = await apnsProduction.send(note, pushToken);

    if (result.sent && result.sent.length > 0) {
      console.log('✅ Wallet push sent successfully via PRODUCTION!');
      console.log('   Device will now call GET /v1/devices/.../registrations/... to check for updates');
      return { success: true, environment: 'production' };
    }

    if (result.failed && result.failed.length > 0) {
      const error = result.failed[0].response;
      console.error('❌ Production also failed:', error?.reason || 'Unknown error');
      return { success: false, error: `Both environments failed. Last error: ${error?.reason || 'Unknown'}`, environment: 'both' };
    }
  } catch (error) {
    console.error('❌ Production attempt threw error:', error);
    return { success: false, error: String(error), environment: 'production' };
  }

  return { success: false, error: 'Failed to send push via both sandbox and production', environment: 'both' };
}

// Legacy interface for regular app notifications (not Wallet passes)
export interface APNSNotification {
  token: string;
  title: string;
  body: string;
  link?: string;
}

/**
 * Send regular APNS notification (for apps, NOT for Wallet passes)
 * Use sendWalletPush() for Apple Wallet pass updates instead.
 */
export async function sendAPNS({ token, title, body, link }: APNSNotification) {
  // Use appropriate environment based on NODE_ENV
  const apns = process.env.NODE_ENV === 'production' ? apnsProduction : apnsSandbox;
  
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

