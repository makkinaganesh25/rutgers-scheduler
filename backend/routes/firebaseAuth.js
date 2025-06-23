// backend/routes/firebaseAuth.js
const express = require('express');
const router = express.Router();
const admin = require('../firebaseAdmin');
const authenticateToken = require('../middleware/auth');

// POST /api/firebase/custom-token
router.post('/custom-token', authenticateToken, async (req, res) => {
  const uid = String(req.user.id);
  const additionalClaims = {
    username: req.user.username,
    user_rank: req.user.user_rank,
    first_name: req.user.first_name
  };

  try {
    const firebaseToken = await admin.auth().createCustomToken(uid, additionalClaims);
    res.json({ firebaseToken });
  } catch (err) {
    console.error('Firebase custom token error:', err);
    res.status(500).json({ error: 'Could not create Firebase token.' });
  }
});

module.exports = router;