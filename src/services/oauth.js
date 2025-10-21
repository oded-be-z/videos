const { google } = require('googleapis');
const fs = require('fs').promises;
const path = require('path');
const readline = require('readline');

/**
 * OAuth2 Client for YouTube API
 * Handles authentication flow and token management
 */
class OAuth2Client {
  constructor() {
    this.oauth2Client = null;
    this.tokenPath = path.join(__dirname, '../../config/youtube-token.json');
    this.credentialsPath = path.join(__dirname, '../../config/youtube-credentials.json');
  }

  /**
   * Get authenticated OAuth2 client
   * @returns {Promise<OAuth2Client>} Authenticated client
   */
  static async getAuthenticatedClient() {
    const client = new OAuth2Client();
    await client.authorize();
    return client.oauth2Client;
  }

  /**
   * Load client credentials from file
   */
  async loadCredentials() {
    try {
      const content = await fs.readFile(this.credentialsPath, 'utf8');
      const credentials = JSON.parse(content);

      // Support both web and installed app credential formats
      const clientConfig = credentials.installed || credentials.web;

      if (!clientConfig) {
        throw new Error('Invalid credentials format. Expected "installed" or "web" credentials.');
      }

      return {
        clientId: clientConfig.client_id,
        clientSecret: clientConfig.client_secret,
        redirectUri: clientConfig.redirect_uris ? clientConfig.redirect_uris[0] : 'urn:ietf:wg:oauth:2.0:oob'
      };
    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new Error(
          `Credentials file not found at ${this.credentialsPath}\n` +
          'Please follow the setup guide in docs/YOUTUBE_SETUP.md to create credentials.'
        );
      }
      throw error;
    }
  }

  /**
   * Load saved token from file
   */
  async loadToken() {
    try {
      const content = await fs.readFile(this.tokenPath, 'utf8');
      return JSON.parse(content);
    } catch (error) {
      return null; // Token doesn't exist yet
    }
  }

  /**
   * Save token to file
   */
  async saveToken(token) {
    try {
      await fs.writeFile(this.tokenPath, JSON.stringify(token, null, 2));
      console.log('Token saved to:', this.tokenPath);
    } catch (error) {
      console.error('Failed to save token:', error.message);
      throw error;
    }
  }

  /**
   * Get new token by prompting user for authorization
   */
  async getNewToken(oauth2Client) {
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/youtube.upload',
        'https://www.googleapis.com/auth/youtube',
        'https://www.googleapis.com/auth/youtube.force-ssl'
      ],
      prompt: 'consent' // Force consent screen to get refresh token
    });

    console.log('\n=================================');
    console.log('YOUTUBE AUTHORIZATION REQUIRED');
    console.log('=================================\n');
    console.log('Please visit this URL to authorize the application:\n');
    console.log(authUrl);
    console.log('\n');

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    return new Promise((resolve, reject) => {
      rl.question('Enter the authorization code from the page: ', async (code) => {
        rl.close();

        try {
          const { tokens } = await oauth2Client.getToken(code);
          await this.saveToken(tokens);
          console.log('\nAuthorization successful!');
          resolve(tokens);
        } catch (error) {
          reject(new Error(`Failed to retrieve access token: ${error.message}`));
        }
      });
    });
  }

  /**
   * Authorize and get OAuth2 client
   */
  async authorize() {
    try {
      // Load credentials
      const credentials = await this.loadCredentials();

      // Create OAuth2 client
      this.oauth2Client = new google.auth.OAuth2(
        credentials.clientId,
        credentials.clientSecret,
        credentials.redirectUri
      );

      // Try to load existing token
      let token = await this.loadToken();

      if (!token) {
        // No token exists, get new one
        console.log('No existing token found. Starting authorization flow...');
        token = await this.getNewToken(this.oauth2Client);
      }

      // Set credentials
      this.oauth2Client.setCredentials(token);

      // Set up automatic token refresh
      this.oauth2Client.on('tokens', async (tokens) => {
        if (tokens.refresh_token) {
          // Got a new refresh token, save it
          await this.saveToken(tokens);
        } else {
          // Only access token refreshed, update with existing refresh token
          const existingToken = await this.loadToken();
          await this.saveToken({
            ...tokens,
            refresh_token: existingToken.refresh_token
          });
        }
      });

      console.log('OAuth2 client authorized successfully');
      return this.oauth2Client;

    } catch (error) {
      console.error('Authorization failed:', error.message);
      throw error;
    }
  }

  /**
   * Revoke token (sign out)
   */
  async revokeToken() {
    try {
      if (this.oauth2Client) {
        await this.oauth2Client.revokeCredentials();
      }

      // Delete token file
      try {
        await fs.unlink(this.tokenPath);
        console.log('Token revoked and deleted');
      } catch (error) {
        // Token file might not exist
      }
    } catch (error) {
      console.error('Failed to revoke token:', error.message);
      throw error;
    }
  }

  /**
   * Check if we have valid credentials
   */
  async hasValidCredentials() {
    try {
      const token = await this.loadToken();
      return token && token.access_token;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get access token (for debugging/testing)
   */
  async getAccessToken() {
    if (!this.oauth2Client) {
      await this.authorize();
    }
    return this.oauth2Client.credentials.access_token;
  }
}

/**
 * Standalone authorization function for setup
 * Run this once to authorize the application
 */
async function runAuthorizationFlow() {
  console.log('Starting YouTube OAuth2 authorization flow...\n');

  try {
    const client = new OAuth2Client();
    await client.authorize();

    console.log('\n=================================');
    console.log('AUTHORIZATION COMPLETE!');
    console.log('=================================\n');
    console.log('Your application is now authorized to access YouTube.');
    console.log('The access token has been saved and will be refreshed automatically.');
    console.log('\nYou can now use the YouTube upload service.');

  } catch (error) {
    console.error('\nAuthorization failed:', error.message);
    process.exit(1);
  }
}

// Run authorization if this file is executed directly
if (require.main === module) {
  runAuthorizationFlow();
}

module.exports = { OAuth2Client, runAuthorizationFlow };
