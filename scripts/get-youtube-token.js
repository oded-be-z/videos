#!/usr/bin/env node

/**
 * YouTube OAuth Token Generator
 *
 * Interactive script to generate YouTube API refresh token
 * for automated video uploads.
 *
 * Usage:
 *   node scripts/get-youtube-token.js
 *
 * Prerequisites:
 *   - Google Cloud project created
 *   - YouTube Data API v3 enabled
 *   - OAuth 2.0 credentials created (Desktop app)
 */

const { google } = require('googleapis');
const http = require('http');
const url = require('url');
const readline = require('readline');
const { promisify } = require('util');

const OAuth2 = google.auth.OAuth2;
const SCOPES = [
  'https://www.googleapis.com/auth/youtube.upload',
  'https://www.googleapis.com/auth/youtube'
];

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function separator() {
  log('blue', '═'.repeat(60));
}

async function promptUser(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function getAuthorizationCode(oauth2Client) {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent' // Force to get refresh token
  });

  log('cyan', '\n📋 Authorization Steps:\n');
  console.log('1. A browser window will open');
  console.log('2. Sign in with your YouTube/Google account');
  console.log('3. Grant permissions to the app');
  console.log('4. You will be redirected to localhost');
  console.log('5. Copy the authorization code from the URL\n');

  log('bright', 'Authorization URL:');
  log('yellow', authUrl);
  console.log('');

  // Try to open browser automatically
  const open = await import('open');
  try {
    await open.default(authUrl);
    log('green', '✅ Browser opened automatically\n');
  } catch (err) {
    log('yellow', '⚠️  Could not open browser automatically');
    log('yellow', 'Please copy the URL above and paste it in your browser\n');
  }

  // Wait for user to complete authorization and paste code
  const code = await promptUser('Enter the authorization code from the redirect URL: ');
  return code;
}

async function getTokens(oauth2Client, code) {
  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    return tokens;
  } catch (err) {
    throw new Error(`Failed to get tokens: ${err.message}`);
  }
}

async function testTokens(oauth2Client) {
  try {
    const youtube = google.youtube({
      version: 'v3',
      auth: oauth2Client
    });

    const response = await youtube.channels.list({
      part: 'snippet,contentDetails,statistics',
      mine: true
    });

    if (response.data.items && response.data.items.length > 0) {
      const channel = response.data.items[0];
      return {
        success: true,
        channelId: channel.id,
        channelTitle: channel.snippet.title,
        subscriberCount: channel.statistics.subscriberCount
      };
    } else {
      return { success: false };
    }
  } catch (err) {
    throw new Error(`Token validation failed: ${err.message}`);
  }
}

async function main() {
  console.clear();
  separator();
  log('bright', '🎥  YouTube OAuth Token Generator - Seekapa Automation');
  separator();
  console.log('');

  // Step 1: Get OAuth credentials
  log('cyan', '📝 Step 1: Enter OAuth 2.0 Credentials\n');
  log('yellow', 'Get these from: https://console.cloud.google.com/apis/credentials\n');

  const clientId = await promptUser('Client ID: ');
  const clientSecret = await promptUser('Client Secret: ');

  if (!clientId || !clientSecret) {
    log('red', '\n❌ Error: Client ID and Client Secret are required');
    process.exit(1);
  }

  console.log('');
  separator();

  // Step 2: Create OAuth client
  const oauth2Client = new OAuth2(
    clientId,
    clientSecret,
    'http://localhost:3000/oauth2callback'
  );

  // Step 3: Get authorization code
  log('cyan', '\n🔐 Step 2: Authorize Application\n');
  const code = await getAuthorizationCode(oauth2Client);

  console.log('');
  separator();

  // Step 4: Exchange code for tokens
  log('cyan', '\n🔄 Step 3: Exchanging Code for Tokens...\n');
  let tokens;
  try {
    tokens = await getTokens(oauth2Client, code);
    log('green', '✅ Tokens received successfully\n');
  } catch (err) {
    log('red', `\n❌ Error: ${err.message}`);
    process.exit(1);
  }

  separator();

  // Step 5: Validate tokens
  log('cyan', '\n✅ Step 4: Validating Tokens...\n');
  let validation;
  try {
    validation = await testTokens(oauth2Client);
    if (validation.success) {
      log('green', '✅ Token validation successful!\n');
      log('bright', 'YouTube Channel Information:');
      console.log(`  Channel ID: ${validation.channelId}`);
      console.log(`  Channel Name: ${validation.channelTitle}`);
      console.log(`  Subscribers: ${validation.subscriberCount}`);
      console.log('');
    } else {
      log('red', '❌ No YouTube channel found for this account');
      process.exit(1);
    }
  } catch (err) {
    log('red', `\n❌ Validation error: ${err.message}`);
    process.exit(1);
  }

  separator();

  // Step 6: Display credentials
  log('bright', '\n🎉 Success! Your YouTube API Credentials:\n');
  separator();
  console.log('');

  log('bright', 'CLIENT_ID:');
  log('yellow', clientId);
  console.log('');

  log('bright', 'CLIENT_SECRET:');
  log('yellow', clientSecret);
  console.log('');

  log('bright', 'REFRESH_TOKEN:');
  log('yellow', tokens.refresh_token);
  console.log('');

  separator();

  // Step 7: GitHub secrets commands
  log('cyan', '\n📦 Add to GitHub Secrets:\n');
  separator();
  console.log('');

  log('bright', 'Copy and run these commands:\n');
  log('green', `gh secret set YOUTUBE_CLIENT_ID --body "${clientId}"`);
  log('green', `gh secret set YOUTUBE_CLIENT_SECRET --body "${clientSecret}"`);
  log('green', `gh secret set YOUTUBE_REFRESH_TOKEN --body "${tokens.refresh_token}"`);
  console.log('');

  separator();

  // Step 8: .env file template
  log('cyan', '\n📄 Or add to .env file:\n');
  separator();
  console.log('');

  console.log('YOUTUBE_CLIENT_ID=' + clientId);
  console.log('YOUTUBE_CLIENT_SECRET=' + clientSecret);
  console.log('YOUTUBE_REFRESH_TOKEN=' + tokens.refresh_token);
  console.log('');

  separator();

  log('green', '\n✅ YouTube OAuth setup complete!');
  log('yellow', '\nNext steps:');
  console.log('1. Add secrets to GitHub repository');
  console.log('2. Test YouTube upload: npm run test:upload');
  console.log('3. Run full pipeline: npm start');
  console.log('');
}

// Run the script
main().catch((err) => {
  log('red', `\n❌ Fatal error: ${err.message}`);
  console.error(err);
  process.exit(1);
});
