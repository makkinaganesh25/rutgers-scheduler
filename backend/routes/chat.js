// // File: backend/routes/chat.js
// require('dotenv').config();
// const express       = require('express');
// const { GoogleAuth } = require('google-auth-library');

// const router = express.Router();

// router.post('/', async (req, res) => {
//   const userQuery = req.body.query;
//   console.log(`\n[Chat] question: "${userQuery}"`);

//   try {
//     // 1) OAuth2 token
//     const authClient  = await new GoogleAuth({
//       scopes: ['https://www.googleapis.com/auth/cloud-platform']
//     }).getClient();
//     const accessToken = await authClient.getAccessToken();

//     // 2) Build the Search URL
//     const apiUrl =
//       `https://discoveryengine.googleapis.com/v1alpha/projects/` +
//       `${process.env.PROJECT_ID}/locations/global/collections/default_collection/` +
//       `engines/${process.env.ENGINE_ID}/servingConfigs/default_search:search`;

//     // 3) Call the API (no queryExpansion/spellCorrection for multi‐datastore)
//     const aiRes = await fetch(apiUrl, {
//       method: 'POST',
//       headers: {
//         'Authorization': `Bearer ${accessToken.token || accessToken}`,
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({
//         query: userQuery,
//         pageSize: 5,
//         languageCode: 'en-US',
//         contentSearchSpec: { extractiveContentSpec: { maxExtractiveAnswerCount: 1 } },
//         userInfo: { timeZone: process.env.TIME_ZONE || 'UTC' }
//       })
//     });

//     const aiJson = await aiRes.json();
//     console.log('[Chat] full response:', JSON.stringify(aiJson, null, 2));

//     // 4) Determine the best answer
//     let answer = "Sorry, I couldn’t find an answer.";

//     if (Array.isArray(aiJson.results) && aiJson.results.length > 0) {
//       const doc = aiJson.results[0].document;

//       // 4a) Extractive answer from SOPs
//       const ext = doc.derivedStructData?.extractive_answers;
//       if (Array.isArray(ext) && ext.length > 0) {
//         answer = ext[0].content.trim();

//       // 4b) Structured data from your officers table
//       } else if (doc.structData?.struct_data) {
//         const sd = doc.structData.struct_data;
//         answer =
//           `**Officer Info**\n` +
//           `• Name: ${sd.First_name} ${sd.Last_name}\n` +
//           `• Rank: ${sd.Rank}\n` +
//           `• Email: ${sd.Primary_Email}\n` +
//           `• Phone: ${sd.Phone}`;

//       // 4c) Snippet fallback (unstructured text)
//       } else if (Array.isArray(doc.derivedStructData?.snippets) &&
//                  doc.derivedStructData.snippets.length > 0) {
//         answer = doc.derivedStructData.snippets[0].snippet.trim();
//       }
//     }

//     return res.json({ answer });

//   } catch (err) {
//     console.error('Chat proxy error:', err);
//     return res.status(500).json({ error: 'Internal server error' });
//   }
// });

// module.exports = router;
// File: backend/routes/chat.js

// // File: backend/routes/chat.js
// require('dotenv').config();
// const express        = require('express');
// const fetch          = require('node-fetch');               // ← install `npm install node-fetch@2`
// const { GoogleAuth } = require('google-auth-library');

// const router = express.Router();

// router.post('/', async (req, res) => {
//   const userQuery = req.body.query;
//   console.log(`[Chat] incoming query: "${userQuery}"`);

//   try {
//     // 1) OAuth2 token
//     const authClient  = await new GoogleAuth({
//       scopes: ['https://www.googleapis.com/auth/cloud-platform']
//     }).getClient();
//     const accessToken = await authClient.getAccessToken();

//     // 2) Build the Search URL
//     const url =
//       `https://discoveryengine.googleapis.com/v1alpha/projects/` +
//       `${process.env.PROJECT_ID}/locations/global/collections/default_collection/` +
//       `engines/${process.env.ENGINE_ID}/servingConfigs/default_search:search`;

//     // 3) Call the API (no queryExpansion for multi-datastore)
//     const apiRes = await fetch(url, {
//       method: 'POST',
//       headers: {
//         'Authorization': `Bearer ${accessToken.token || accessToken}`,
//         'Content-Type':  'application/json',
//       },
//       body: JSON.stringify({
//         query: userQuery,
//         pageSize: 5,
//         languageCode: 'en-US',
//         contentSearchSpec: {
//           extractiveContentSpec: { maxExtractiveAnswerCount: 1 }
//         },
//         userInfo: { timeZone: process.env.TIME_ZONE || 'UTC' }
//       })
//     });

//     const json = await apiRes.json();
//     console.log('[Chat] discovery response:', JSON.stringify(json, null, 2));

//     // 4) Default payload
//     let payload = { type: 'text', text: "Sorry, I couldn’t find an answer." };

//     if (Array.isArray(json.results) && json.results.length > 0) {
//       const doc = json.results[0].document;

//       // 4a) SOP extractive
//       const ext = doc.derivedStructData?.extractive_answers;
//       if (Array.isArray(ext) && ext.length > 0) {
//         payload = { type: 'sop', text: ext[0].content.trim() };

//       // 4b) Officer structured
//       } else if (doc.structData?.struct_data) {
//         const sd = doc.structData.struct_data;
//         payload = {
//           type: 'officer',
//           data: {
//             name:  `${sd.First_name} ${sd.Last_name}`.trim(),
//             rank:  sd.Rank,
//             email: sd.Primary_Email,
//             phone: sd.Phone
//           }
//         };

//       // 4c) Fallback snippet
//       } else if (doc.derivedStructData?.snippets?.length) {
//         payload = { type: 'sop', text: doc.derivedStructData.snippets[0].snippet.trim() };
//       }
//     }

//     return res.json(payload);

//   } catch (err) {
//     console.error('[Chat] proxy error:', err);
//     return res.status(500).json({ type:'error', text: 'Internal server error' });
//   }
// });

// module.exports = router;

// File: backend/routes/chat.js
require('dotenv').config();
const express        = require('express');
const fetch          = require('node-fetch');                   // ← polyfill for fetch()
const { GoogleAuth } = require('google-auth-library');

const router = express.Router();

// simple HTML‐entity decode for common cases
function decodeEntities(str) {
  return str
    .replace(/&#39;/g, `'`)
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, `"`)
    .replace(/&amp;/g, '&');
}

router.post('/', async (req, res) => {
  const userQuery = req.body.query;

  try {
    // 1) Get OAuth2 token
    const authClient  = await new GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/cloud-platform']
    }).getClient();
    const accessToken = await authClient.getAccessToken();

    // 2) Build URL
    const url =
      `https://discoveryengine.googleapis.com/v1alpha/projects/` +
      `${process.env.PROJECT_ID}/locations/global/collections/default_collection/` +
      `engines/${process.env.ENGINE_ID}/servingConfigs/default_search:search`;

    // 3) Search call (no queryExpansion for multi‐datastore)
    const apiRes = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken.token || accessToken}`,
        'Content-Type':  'application/json',
      },
      body: JSON.stringify({
        query: userQuery,
        pageSize: 5,
        languageCode: 'en-US',
        contentSearchSpec: {
          extractiveContentSpec: { maxExtractiveAnswerCount: 1 }
        },
        userInfo: { timeZone: process.env.TIME_ZONE || 'UTC' }
      })
    });
    const json = await apiRes.json();

    // default fallback
    let payload = { type: 'text', text: "Sorry, I couldn’t find an answer." };

    if (Array.isArray(json.results) && json.results.length > 0) {
      const doc = json.results[0].document;

      // 4a) SOP extractive answer
      const ext = doc.derivedStructData?.extractive_answers;
      if (ext?.length) {
        let txt = ext[0].content;
        // strip tags, decode entities, split bullets, trim
        txt = decodeEntities(txt)
          .replace(/<[^>]+>/g, '')
          .replace(/\s*•\s*/g, '\n▪ ')
          .trim();

        payload = { type: 'sop', text: txt };

      // 4b) Officer structured data
      } else if (doc.structData?.struct_data) {
        const sd = doc.structData.struct_data;
        payload = {
          type: 'officer',
          data: {
            name:  `${sd.First_name} ${sd.Last_name}`.trim(),
            rank:  sd.Rank,
            email: sd.Primary_Email,
            phone: sd.Phone
          }
        };

      // 4c) Snippet fallback
      } else if (doc.derivedStructData?.snippets?.length) {
        let snip = doc.derivedStructData.snippets[0].snippet;
        snip = decodeEntities(snip)
          .replace(/<[^>]+>/g, '')
          .replace(/\s*•\s*/g, '\n▪ ')
          .trim();

        payload = { type: 'sop', text: snip };
      }
    }

    return res.json(payload);

  } catch (err) {
    console.error('Chat proxy error:', err);
    return res.status(500).json({ type:'error', text: 'Internal server error' });
  }
});

module.exports = router;
