const express = require('express');
const axios = require('axios');
const querystring = require('querystring');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Simple test OAuth (no state, no scope)
router.get('/test-simple', (req, res) => {
  const simpleUrl = `https://airtable.com/oauth2/v1/authorize?client_id=${process.env.AIRTABLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(process.env.AIRTABLE_REDIRECT_URI)}&response_type=code`;
  res.redirect(simpleUrl);
});

// Airtable OAuth login
router.get('/airtable', (req, res) => {
  // Generate a simple state parameter
  const state = Date.now().toString() + Math.random().toString(36).substring(2, 8);
  
  // Generate PKCE parameters
  const codeVerifier = crypto.randomBytes(32).toString('base64url');
  const codeChallenge = crypto.createHash('sha256').update(codeVerifier).digest('base64url');
  
  // Store both state and code verifier in session
  if (req.session) {
    req.session.oauthState = state;
    req.session.codeVerifier = codeVerifier;
  }
  
  // Include scopes and PKCE in the OAuth URL
  const scopes = 'data.records:read data.records:write schema.bases:read user.email:read';
  const authUrl = `https://airtable.com/oauth2/v1/authorize?` +
    `client_id=${process.env.AIRTABLE_CLIENT_ID}&` +
    `redirect_uri=${encodeURIComponent(process.env.AIRTABLE_REDIRECT_URI)}&` +
    `response_type=code&` +
    `state=${state}&` +
    `scope=${encodeURIComponent(scopes)}&` +
    `code_challenge=${codeChallenge}&` +
    `code_challenge_method=S256`;
  
  console.log('=== OAuth Debug ===');
  console.log('Client ID:', process.env.AIRTABLE_CLIENT_ID);
  console.log('Client Secret Length:', process.env.AIRTABLE_CLIENT_SECRET?.length);
  console.log('Redirect URI:', process.env.AIRTABLE_REDIRECT_URI);
  console.log('State:', state);
  console.log('Code Challenge:', codeChallenge);
  console.log('Session available:', !!req.session);
  console.log('Auth URL:', authUrl);
  console.log('==================');
  
  res.redirect(authUrl);
});

// Debug endpoint to check OAuth app configuration
router.get('/debug-oauth', async (req, res) => {
  try {
    // Test if we can make a basic request to Airtable with our client credentials
    const testUrl = `https://airtable.com/oauth2/v1/authorize?client_id=${process.env.AIRTABLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(process.env.AIRTABLE_REDIRECT_URI)}&response_type=code`;
    
    res.json({
      status: 'OAuth Configuration Debug',
      client_id: process.env.AIRTABLE_CLIENT_ID,
      redirect_uri: process.env.AIRTABLE_REDIRECT_URI,
      client_secret_length: process.env.AIRTABLE_CLIENT_SECRET?.length,
      test_url: testUrl,
      frontend_url: process.env.FRONTEND_URL
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Test endpoint to see OAuth URL
router.get('/test-oauth-url', (req, res) => {
  const basicUrl = `https://airtable.com/oauth2/v1/authorize?client_id=${process.env.AIRTABLE_CLIENT_ID}&redirect_uri=http://localhost:5000/auth/airtable/callback&response_type=code`;
  
  res.send(`
    <h2>OAuth Configuration Test</h2>
    <p><strong>Client ID:</strong> ${process.env.AIRTABLE_CLIENT_ID}</p>
    <p><strong>Client Secret:</strong> ${process.env.AIRTABLE_CLIENT_SECRET ? 'SET (length: ' + process.env.AIRTABLE_CLIENT_SECRET.length + ')' : 'NOT SET'}</p>
    <p><strong>Redirect URI:</strong> ${process.env.AIRTABLE_REDIRECT_URI}</p>
    
    <h3>Test Links:</h3>
    <p><a href="${basicUrl}" target="_blank">Test Basic OAuth (No scopes, no state)</a></p>
    <p><code>${basicUrl}</code></p>
    
    <hr>
    <h3>Manual Test</h3>
    <p>Copy this URL and paste it in a new tab:</p>
    <textarea style="width:100%; height:100px;">${basicUrl}</textarea>
  `);
});

// Airtable OAuth callback
router.get('/airtable/callback', async (req, res) => {
  try {
    const { code, state, error, error_description } = req.query;
    
    console.log('OAuth callback received:', { code: !!code, state, error, error_description });
    console.log('Session state:', req.session?.oauthState);
    
    if (error) {
      console.error('OAuth error:', error, error_description);
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=${error}&description=${encodeURIComponent(error_description || '')}`);
    }
    
    if (!code) {
      console.error('No authorization code received');
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=no_code`);
    }

    // Verify state parameter only if we have both states
    if (req.session?.oauthState && state && state !== req.session.oauthState) {
      console.error('State mismatch:', { expected: req.session.oauthState, received: state });
      // For now, let's continue anyway to test if the rest works
      console.log('Continuing despite state mismatch for testing...');
    }

    console.log('Exchanging code for tokens...');
    console.log('Using Client ID:', process.env.AIRTABLE_CLIENT_ID);
    console.log('Client Secret length:', process.env.AIRTABLE_CLIENT_SECRET?.length);

    // Get code verifier from session
    const codeVerifier = req.session?.codeVerifier;
    if (!codeVerifier) {
      console.error('No code verifier found in session');
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=missing_code_verifier`);
    }

    // Exchange code for tokens using proper format with PKCE
    const tokenData = {
      redirect_uri: process.env.AIRTABLE_REDIRECT_URI,
      code: code,
      grant_type: 'authorization_code',
      code_verifier: codeVerifier
    };

    // Create Basic Auth header for client credentials
    const credentials = Buffer.from(`${process.env.AIRTABLE_CLIENT_ID}:${process.env.AIRTABLE_CLIENT_SECRET}`).toString('base64');

    console.log('Token request data:', { ...tokenData, code_verifier: '[HIDDEN]' });

    const tokenResponse = await axios.post(
      'https://airtable.com/oauth2/v1/token',
      new URLSearchParams(tokenData).toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${credentials}`
        }
      }
    );

    console.log('Token response received');

    const { access_token, refresh_token, expires_in } = tokenResponse.data;

    if (!access_token) {
      throw new Error('No access token received from Airtable');
    }

    // Get user info from Airtable
    console.log('Fetching user info from Airtable...');
    const userResponse = await axios.get('https://api.airtable.com/v0/meta/whoami', {
      headers: {
        'Authorization': `Bearer ${access_token}`
      }
    });

    const airtableUser = userResponse.data;
    console.log('User info received:', { id: airtableUser.id, email: airtableUser.email });

    // Save or update user in database
    let user = await User.findOne({ airtableId: airtableUser.id });
    
    if (user) {
      console.log('Updating existing user');
      user.accessToken = access_token;
      user.refreshToken = refresh_token;
      user.tokenExpiresAt = new Date(Date.now() + (expires_in || 3600) * 1000);
      user.email = airtableUser.email;
      user.name = airtableUser.name;
    } else {
      console.log('Creating new user');
      user = new User({
        airtableId: airtableUser.id,
        email: airtableUser.email,
        name: airtableUser.name,
        accessToken: access_token,
        refreshToken: refresh_token,
        tokenExpiresAt: new Date(Date.now() + (expires_in || 3600) * 1000)
      });
    }
    
    await user.save();
    console.log('User saved to database');

    // Create JWT token for our app
    const jwtToken = jwt.sign(
      { userId: user._id, airtableId: user.airtableId },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );

    // Clear the OAuth state from session
    delete req.session.oauthState;

    console.log('Redirecting to frontend with success token');
    // Redirect to frontend with success
    res.redirect(`${process.env.FRONTEND_URL}/auth-success?token=${jwtToken}`);
  } catch (error) {
    console.error('OAuth callback error:', error.response?.data || error.message);
    console.error('Full error:', error);
    res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed&message=${encodeURIComponent(error.message)}`);
  }
});

// Get current user info
router.get('/me', authenticateToken, (req, res) => {
  res.json({
    id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    airtableId: req.user.airtableId
  });
});

// Logout
router.post('/logout', authenticateToken, (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

// Utility: ensure valid access token
async function ensureAccessToken(user) {
  if (new Date() < new Date(user.tokenExpiresAt)) {
    return user.accessToken; // still valid
  }

  // Refresh
  const tokenResponse = await axios.post(
    'https://airtable.com/oauth2/v1/token',
    querystring.stringify({
      grant_type: 'refresh_token',
      refresh_token: user.refreshToken,
      client_id: process.env.AIRTABLE_CLIENT_ID,
      client_secret: process.env.AIRTABLE_CLIENT_SECRET,
    }),
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
  );

  const { access_token, expires_in } = tokenResponse.data;

  user.accessToken = access_token;
  user.tokenExpiresAt = new Date(Date.now() + expires_in * 1000);
  await user.save();

  return user.accessToken;
}

// Get user's Airtable bases
router.get('/bases', authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    const token = await ensureAccessToken(user);

    const response = await axios.get('https://api.airtable.com/v0/meta/bases', {
      headers: { Authorization: `Bearer ${token}` }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching bases:', error.response?.data || error.message);
    res.status(500).json({ message: 'Failed to fetch bases' });
  }
});

// Get tables in base
router.get('/bases/:baseId/tables', authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    const token = await ensureAccessToken(user);

    const { baseId } = req.params;
    const response = await axios.get(
      `https://api.airtable.com/v0/meta/bases/${baseId}/tables`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching tables:', error.response?.data || error.message);
    res.status(500).json({ message: 'Failed to fetch tables' });
  }
});

// Get fields in a specific table
router.get('/bases/:baseId/tables/:tableId/fields', authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    const token = await ensureAccessToken(user);

    const { baseId, tableId } = req.params;
    const response = await axios.get(
      `https://api.airtable.com/v0/meta/bases/${baseId}/tables/${tableId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const supportedTypes = [
      'singleLineText',
      'multilineText',
      'singleSelect',
      'multipleSelects',
      'multipleAttachments'
    ];

    const supportedFields = response.data.fields.filter(f =>
      supportedTypes.includes(f.type)
    );

    res.json({ fields: supportedFields });
  } catch (error) {
    console.error('Error fetching fields:', error.response?.data || error.message);
    res.status(500).json({ message: 'Failed to fetch fields' });
  }
});

// Create a record
router.post('/bases/:baseId/tables/:tableId/records', authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    const token = await ensureAccessToken(user);

    const { baseId, tableId } = req.params;
    const { fields } = req.body;

    const response = await axios.post(
      `https://api.airtable.com/v0/${baseId}/${tableId}`,
      { fields },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error('Error creating record:', error.response?.data || error.message);
    res.status(500).json({
      message: 'Failed to create record',
      error: error.response?.data || error.message
    });
  }
});

module.exports = router;
