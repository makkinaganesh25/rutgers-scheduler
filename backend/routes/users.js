// // File: backend/routes/users.js
// const express = require('express');
// const bcrypt  = require('bcrypt');
// const jwt     = require('jsonwebtoken');
// const db      = require('../db');       // promise‐pool
// require('dotenv').config();

// const router     = express.Router();
// const JWT_SECRET = process.env.JWT_SECRET;

// // --------------------------------------------------
// // POST /api/users/register
// // --------------------------------------------------
// router.post('/register', async (req, res) => {
//   const { username, password, first_name, phone, email, user_rank } = req.body;
//   if (!username || !password) {
//     return res.status(400).json({ error: 'Username and password required' });
//   }

//   try {
//     // 1) Check if username exists
//     const [exists] = await db.query(
//       'SELECT id FROM users WHERE username = ?',
//       [username]
//     );
//     if (exists.length) {
//       return res.status(409).json({ error: 'User already exists' });
//     }

//     // 2) Hash password
//     const hash = await bcrypt.hash(password, 10);

//     // 3) Insert new user
//     const [result] = await db.query(
//       `INSERT INTO users
//          (username, password, first_name, phone, email, user_rank, manager_id)
//        VALUES (?, ?, ?, ?, ?, ?, NULL)`,
//       [username, hash, first_name || null, phone || null, email || null, user_rank || null]
//     );

//     res.status(201).json({ message: 'User created', userId: result.insertId });
//   } catch (err) {
//     console.error('Register error:', err);
//     res.status(500).json({ error: 'Server error' });
//   }
// });

// // --------------------------------------------------
// // POST /api/users/login
// // --------------------------------------------------
// router.post('/login', async (req, res) => {
//   const { username, password } = req.body;
//   if (!username || !password) {
//     return res.status(400).json({ error: 'Username and password required' });
//   }

//   try {
//     // 1) Fetch user record
//     const [rows] = await db.query(
//       `SELECT id, username, password, user_rank, first_name, phone, email
//        FROM users
//        WHERE username = ?`,
//       [username]
//     );
//     if (!rows.length) {
//       return res.status(401).json({ error: 'Invalid credentials' });
//     }
//     const user = rows[0];

//     // 2) Compare password
//     const match = await bcrypt.compare(password, user.password);
//     if (!match) {
//       return res.status(401).json({ error: 'Invalid credentials' });
//     }

//     // 3) Build JWT payload
//     const payload = {
//       id:         user.id,
//       username:   user.username,
//       user_rank:  user.user_rank,
//       first_name: user.first_name,
//       phone:      user.phone,
//       email:      user.email
//     };

//     // 4) Sign token
//     const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });

//     // 5) Return token + user info
//     res.json({ token, user: payload });
//   } catch (err) {
//     console.error('Login error:', err);
//     res.status(500).json({ error: 'Server error' });
//   }
// });

// module.exports = router;


// File: backend/routes/users.js
require('dotenv').config();
const express = require('express');
const bcrypt  = require('bcrypt');
const jwt     = require('jsonwebtoken');
const db      = require('../db');       // your promise‐pool
const router  = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

// --------------------------------------------------
// POST /api/users/register
// (unchanged from your existing code)
// --------------------------------------------------
router.post('/register', async (req, res) => {
  const { username, password, first_name, phone, email, user_rank } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }

  try {
    // 1) Check if username exists in users
    const [exists] = await db.query(
      'SELECT id FROM users WHERE username = ?',
      [username]
    );
    if (exists.length) {
      return res.status(409).json({ error: 'User already exists' });
    }

    // 2) Hash password
    const hash = await bcrypt.hash(password, 10);

    // 3) Insert new user (default division 'cso')
    const [result] = await db.query(
      `INSERT INTO users
         (username, password, first_name, phone, email, user_rank, manager_id)
       VALUES (?, ?, ?, ?, ?, ?, NULL)`,
      [username, hash, first_name || null, phone || null, email || null, user_rank || null]
    );

    res.status(201).json({ message: 'User created', userId: result.insertId });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// --------------------------------------------------
// POST /api/users/login
//   • Try users → fallback to security_officers
//   • Return { token, user: { …, division } }
// --------------------------------------------------
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }

  try {
    let rows, userRow, division;

    // 1) Try the main users table
    [rows] = await db.query(
      `SELECT id, username, password AS hash, user_rank,
              first_name, phone, email
       FROM users
       WHERE username = ?`,
      [username]
    );
    if (rows.length) {
      userRow  = rows[0];
      division = 'cso';
    } else {
      // 2) Fallback to security_officers
      [rows] = await db.query(
        `SELECT id, username, password AS hash, user_rank,
                first_name, phone, email
         FROM security_officers
         WHERE username = ?`,
        [username]
      );
      if (!rows.length) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      userRow  = rows[0];
      division = 'security';
    }

    // 3) Verify password
    const match = await bcrypt.compare(password, userRow.hash);
    if (!match) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // 4) Build JWT payload
    const payload = {
      id:         userRow.id,
      username:   userRow.username,
      user_rank:  userRow.user_rank,
      first_name: userRow.first_name,
      phone:      userRow.phone,
      email:      userRow.email,
      division    // 'cso' or 'security'
    };

    // 5) Sign token
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });

    // 6) Return token + user (omit hash)
    res.json({
      token,
      user: payload
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
