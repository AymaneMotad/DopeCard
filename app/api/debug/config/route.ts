/**
 * Debug endpoint to check pass generation configuration
 * GET /api/debug/config
 * 
 * Shows what environment variables are set for pass generation
 * without exposing actual values
 */

import { NextResponse } from 'next/server';

export async function GET() {
  const baseUrl = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const enableWebService = process.env.ENABLE_WEB_SERVICE_URL === 'true';
  const hasAuthToken = !!process.env.PASS_AUTH_TOKEN;
  const authTokenLength = process.env.PASS_AUTH_TOKEN?.length || 0;

  // Check what would be included in the pass
  const wouldIncludeWebService = enableWebService && hasAuthToken;
  const webServiceURL = wouldIncludeWebService ? `${baseUrl}/api/passes/v1` : null;

  // Diagnose issues
  const issues: string[] = [];
  
  if (!enableWebService) {
    issues.push('ENABLE_WEB_SERVICE_URL is not set to "true" - webServiceURL will NOT be included in passes');
  }
  
  if (!hasAuthToken) {
    issues.push('PASS_AUTH_TOKEN is not set - webServiceURL will NOT be included in passes');
  }
  
  if (baseUrl === 'http://localhost:3000') {
    issues.push('APP_URL and NEXT_PUBLIC_APP_URL are not set - using localhost (Apple Wallet cannot reach this)');
  }
  
  if (baseUrl.startsWith('http://') && !baseUrl.includes('localhost')) {
    issues.push('URL is HTTP (not HTTPS) - Apple Wallet requires HTTPS');
  }

  return NextResponse.json({
    status: issues.length === 0 ? '✅ Configuration looks good' : '⚠️ Issues detected',
    configuration: {
      APP_URL: process.env.APP_URL ? '✅ SET' : '❌ NOT SET',
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL ? '✅ SET' : '❌ NOT SET',
      ENABLE_WEB_SERVICE_URL: enableWebService ? '✅ true' : `❌ "${process.env.ENABLE_WEB_SERVICE_URL || 'not set'}"`,
      PASS_AUTH_TOKEN: hasAuthToken ? `✅ SET (${authTokenLength} chars)` : '❌ NOT SET',
    },
    passWillInclude: {
      webServiceURL: webServiceURL || '❌ DISABLED - Apple Wallet will NOT register devices',
      authenticationToken: hasAuthToken ? '✅ Will be included' : '❌ Missing',
    },
    resolvedBaseUrl: baseUrl,
    issues: issues.length > 0 ? issues : ['None - configuration is correct'],
    nextSteps: issues.length > 0 ? [
      '1. Fix the issues listed above in your .env file',
      '2. Restart your dev server (npm run dev)',
      '3. Delete the old pass from Apple Wallet',
      '4. Generate a NEW pass from /admin/test-card',
      '5. Add the new pass to Apple Wallet',
      '6. Check this endpoint again to verify registration'
    ] : [
      '1. Generate a new pass from /admin/test-card',
      '2. Delete any old passes from Apple Wallet first',
      '3. Add the new pass to Apple Wallet',
      '4. Apple Wallet should now register with your server'
    ],
  });
}
