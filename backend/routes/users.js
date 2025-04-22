// backend/routes/users.js
const express = require('express');
const bcrypt  = require('bcrypt');
const jwt     = require('jsonwebtoken');
const db      = require('../db');
require('dotenv').config();

const router = express.Router();

// POST /api/users/register  (optional, if you want self‑sign‑up)
router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }
  db.query(
    'SELECT * FROM users WHERE username = ?',
    [username],
    async (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      if (results.length) {
        return res.status(409).json({ error: 'User already exists' });
      }
      const hash = await bcrypt.hash(password, 10);
      db.query(
        'INSERT INTO users (username, password) VALUES (?, ?)',
        [username, hash],
        (insErr) => {
          if (insErr) return res.status(500).json({ error: insErr.message });
          res.status(201).json({ message: 'User created' });
        }
      );
    }
  );
});

// POST /api/users/login
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }

  db.query(
    'SELECT * FROM users WHERE username = ?',
    [username],
    async (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!results.length) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      const user = results[0];
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      const token = jwt.sign(
        { id: user.id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: '8h' }
      );
      res.json({ token });
    }
  );
});

module.exports = router;
