const express = require('express');
const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');
require('dotenv').config();

const router = express.Router();

const {
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI,
  TOKEN_PATH
} = process.env;

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

// Step 1: Redirect user to consent screen
router.get('/auth', (req, res) => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
  });

  res.redirect(authUrl);
});

// Step 2: OAuth callback to exchange code for token
router.get('/oauth2callback', async (req, res) => {
  const code = req.query.code;

  if (!code) {
    return res.status(400).send('Authorization code not found');
  }

  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Save token to file
    fs.mkdirSync(path.dirname(TOKEN_PATH), { recursive: true });
    fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens, null, 2));

    res.send('Authorization successful. You can now close this tab.');
  } catch (err) {
    console.error('Error exchanging code for token:', err);
    res.status(500).send('Failed to authenticate');
  }
});

module.exports = router;
