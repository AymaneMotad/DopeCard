/**
 * APNS Environment Variable Setup Helper
 * 
 * This script helps format the APNS key for environment variables
 * Run: npx tsx scripts/setup-apns-env.ts
 */

import * as fs from 'fs';
import * as path from 'path';

const APNS_KEY_FILE = path.join(__dirname, '../AuthKey_2ALDJ2F9G3.p8');
const ENV_EXAMPLE_FILE = path.join(__dirname, '../.env.example');

// Your APNS configuration
const APNS_CONFIG = {
  keyId: '2ALDJ2F9G3',
  teamId: 'DTWNQT4JQL',
  topic: 'pass.com.dopecard.passmaker',
};

function formatKeyForEnv(keyContent: string): string {
  // Replace actual newlines with \n for environment variable
  return keyContent
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .join('\\n');
}

function main() {
  console.log('🔧 APNS Environment Variable Setup\n');

  // Read the APNS key file
  if (!fs.existsSync(APNS_KEY_FILE)) {
    console.error(`❌ APNS key file not found: ${APNS_KEY_FILE}`);
    console.log('💡 Make sure AuthKey_2ALDJ2F9G3.p8 is in the project root');
    process.exit(1);
  }

  const keyContent = fs.readFileSync(APNS_KEY_FILE, 'utf-8');
  const formattedKey = formatKeyForEnv(keyContent);

  console.log('✅ APNS Key loaded successfully\n');

  // Generate environment variables
  const envVars = `
# APNS Configuration for Apple Wallet Push Notifications
APNS_KEY="${formattedKey}"
APNS_KEY_ID=${APNS_CONFIG.keyId}
APPLE_TEAM_ID=${APNS_CONFIG.teamId}
APNS_TOPIC=${APNS_CONFIG.topic}
`.trim();

  console.log('📋 Add these to your .env file:\n');
  console.log('─'.repeat(60));
  console.log(envVars);
  console.log('─'.repeat(60));
  console.log('\n');

  // Optionally update .env.example
  if (fs.existsSync(ENV_EXAMPLE_FILE)) {
    const envExample = fs.readFileSync(ENV_EXAMPLE_FILE, 'utf-8');
    
    if (!envExample.includes('APNS_KEY')) {
      fs.appendFileSync(ENV_EXAMPLE_FILE, '\n' + envVars);
      console.log('✅ Updated .env.example file');
    } else {
      console.log('ℹ️  .env.example already contains APNS configuration');
    }
  }

  console.log('\n✨ Next steps:');
  console.log('1. Copy the environment variables above to your .env file');
  console.log('2. Restart your development server');
  console.log('3. Test with: npm run dev');
}

main();



