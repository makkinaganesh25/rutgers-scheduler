// backend/routes/chat.js
require('dotenv').config();
const express      = require('express');
const { GoogleAuth } = require('google-auth-library');

const router = express.Router();

router.post('/', async (req, res) => {
  const userQuery = req.body.query;

  try {
    // 1) Get an OAuth2 bearer token
    const authClient = await new GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/cloud-platform']
    }).getClient();
    const accessToken = await authClient.getAccessToken();

    // 2) Build the Discovery Engine search URL
    const apiUrl =
      `https://discoveryengine.googleapis.com/v1alpha/projects/` +
      `${process.env.PROJECT_ID}/locations/global/collections/default_collection/` +
      `engines/${process.env.ENGINE_ID}/servingConfigs/default_search:search`;

    // 3) Call the API
    const aiRes = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken.token || accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: userQuery,
        pageSize: 10,
        queryExpansionSpec: { condition: 'AUTO' },
        spellCorrectionSpec: { mode: 'AUTO' },
        languageCode: 'en-US',
        contentSearchSpec: { extractiveContentSpec: { maxExtractiveAnswerCount: 1 } },
        userInfo: { timeZone: process.env.TIME_ZONE }
      })
    });

    const aiJson = await aiRes.json();

    // 4) Extract the first extractive answer
    let answer = 'Sorry, I couldn’t find an answer in the SOPs.';
    if (Array.isArray(aiJson.results) && aiJson.results.length > 0) {
      const derived = aiJson.results[0].document.derivedStructData;
      if (Array.isArray(derived.extractive_answers) && derived.extractive_answers.length > 0) {
        answer = derived.extractive_answers[0].content;
      }
    }

    // 5) Return just the answer
    return res.json({ answer });

  } catch (err) {
    console.error('Chat proxy error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
