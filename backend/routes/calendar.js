// File: backend/routes/calendar.js

const express = require('express');
const { google } = require('googleapis');
const creds = require('../credentials.json').web;

const router = express.Router();

// Make sure this URI is in both your credentials.json AND Cloud Console
const REDIRECT_URI = 'http://localhost:5001/api/calendar/exchange-code';

const oauth2Client = new google.auth.OAuth2(
  creds.client_id,
  creds.client_secret,
  REDIRECT_URI
);

// 1) Generate the Google consent URL
router.get('/auth-url', (req, res) => {
  console.log('🔷 /auth-url called with:', req.query);
  const state = JSON.stringify(req.query);
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt:      'consent',
    scope:       ['https://www.googleapis.com/auth/calendar.events'],
    state
  });
  res.json({ url });
});

// 2) Exchange code → insert event → redirect
router.get('/exchange-code', async (req, res) => {
  console.log('✅ /exchange-code called with', req.query);
  try {
    const { code, state } = req.query;

    // 2a) exchange for tokens
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // 2b) unpack and normalize date to YYYY-MM-DD
    const raw = JSON.parse(state);
    const dateOnly = new Date(raw.shiftDate).toISOString().slice(0, 10);

    // 2c) build the event payload
    const event = {
      summary:     raw.summary,
      description: raw.description,
      start:  { dateTime: `${dateOnly}T${raw.startTime}`, timeZone: 'America/New_York' },
      end:    { dateTime: `${dateOnly}T${raw.endTime}`,   timeZone: 'America/New_York' },
      reminders:  { useDefault: true }
    };

    // 2d) insert into primary calendar
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    const insertRes = await calendar.events.insert({
      calendarId: 'primary',
      resource:   event
    });
    console.log('📅 Inserted event:', insertRes.data.id);

    // 2e) redirect back to your React app
    res.redirect('http://localhost:3000/calendar');
  } catch (err) {
    console.error('📌 Calendar OAuth error:', err.errors || err);
    res.status(500).send('❌ Calendar setup failed');
  }
});

module.exports = router;
