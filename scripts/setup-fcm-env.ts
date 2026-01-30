/**
 * FCM Environment Variable Setup Helper
 * 
 * This script helps format the Firebase credentials for environment variables
 * Run: npx tsx scripts/setup-fcm-env.ts
 */

import * as fs from 'fs';
import * as path from 'path';

const FCM_KEY_FILE = path.join(__dirname, '../x-card-1f4eb-firebase-adminsdk-fbsvc-55a6ae9c3a.json');
const ENV_EXAMPLE_FILE = path.join(__dirname, '../.env.example');

function main() {
  console.log('🔧 FCM Environment Variable Setup\n');

  // Read the Firebase credentials file
  if (!fs.existsSync(FCM_KEY_FILE)) {
    console.error(`❌ Firebase credentials file not found: ${FCM_KEY_FILE}`);
    console.log('💡 Make sure x-card-1f4eb-firebase-adminsdk-fbsvc-55a6ae9c3a.json is in the project root');
    process.exit(1);
  }

  const credentials = JSON.parse(fs.readFileSync(FCM_KEY_FILE, 'utf-8'));
  
  console.log('✅ Firebase credentials loaded successfully');
  console.log(`   Project ID: ${credentials.project_id}`);
  console.log(`   Client Email: ${credentials.client_email}\n`);

  // Format credentials as a single-line JSON string for environment variable
  const credentialsString = JSON.stringify(credentials);

  // Generate environment variables
  const envVars = `
# FCM Configuration for Google Pay Push Notifications
FCM_CREDENTIALS='${credentialsString}'
`.trim();

  console.log('📋 Add this to your .env file:\n');
  console.log('─'.repeat(60));
  console.log(envVars);
  console.log('─'.repeat(60));
  console.log('\n');

  // Optionally update .env.example
  if (fs.existsSync(ENV_EXAMPLE_FILE)) {
    const envExample = fs.readFileSync(ENV_EXAMPLE_FILE, 'utf-8');
    
    if (!envExample.includes('FCM_CREDENTIALS')) {
      fs.appendFileSync(ENV_EXAMPLE_FILE, '\n' + envVars);
      console.log('✅ Updated .env.example file');
    } else {
      console.log('ℹ️  .env.example already contains FCM configuration');
    }
  }

  console.log('\n✨ Next steps:');
  console.log('1. Copy the environment variable above to your .env file');
  console.log('2. Restart your development server');
  console.log('3. Test with: npm run dev');
  console.log('\n💡 Note: The FCM_CREDENTIALS must be a single-line JSON string');
}

main();


