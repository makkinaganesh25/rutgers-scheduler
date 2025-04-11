// // module.exports = router;
// // backend/routes/users.js
// // routes/users.js
// const express = require('express');
// const bcrypt = require('bcrypt');
// const db = require('../db');
// const router = express.Router();

// // Register a new user
// router.post('/register', async (req, res) => {
//   const { username, password } = req.body;
//   try {
//     const hashedPassword = await bcrypt.hash(password, 10);
//     const query = 'INSERT INTO users (username, password) VALUES (?, ?)';
//     db.query(query, [username, hashedPassword], (err, result) => {
//       if (err) {
//         // Detect duplicate entry error code
//         if (err.code === 'ER_DUP_ENTRY') {
//           return res.status(400).json({ message: 'Username already exists. Please choose another one.' });
//         }
//         console.error('Error registering user:', err);
//         return res.status(500).send('Server error');
//       }
//       res.json({ message: 'User registered successfully', userId: result.insertId });
//     });
//   } catch (error) {
//     res.status(500).send('Error hashing password');
//   }
// });

// // Login endpoint
// router.post('/login', async (req, res) => {
//   const { username, password } = req.body;
//   const query = 'SELECT * FROM users WHERE username = ?';
//   db.query(query, [username], async (err, results) => {
//     if (err) {
//       return res.status(500).json({ success: false, message: 'Server error while fetching user' });
//     }
//     if (results.length === 0) {
//       return res.status(400).json({ success: false, message: 'Invalid username or password' });
//     }
//     const user = results[0];
//     try {
//       const isMatch = await bcrypt.compare(password, user.password);
//       if (isMatch) {
//         // Return a dummy token; later you can generate a real JWT
//         res.json({ success: true, message: 'Login successful', token: 'dummy-token' });
//       } else {
//         res.status(400).json({ success: false, message: 'Invalid username or password' });
//       }
//     } catch (compareError) {
//       res.status(500).json({ success: false, message: 'Error during password comparison' });
//     }
//   });
// });

// module.exports = router;

// backend/routes/users.js
const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../db');

const router = express.Router();

// Register endpoint: hashes the password before saving.
router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = 'INSERT INTO users (username, password) VALUES (?, ?)';
    db.query(query, [username, hashedPassword], (err, result) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(400).json({ message: 'Username already exists. Please choose another one.' });
        }
        console.error('Error registering user:', err);
        return res.status(500).send('Server error');
      }
      res.json({ message: 'User registered successfully', userId: result.insertId });
    });
  } catch (error) {
    res.status(500).send('Error hashing password');
  }
});

// Login endpoint: compares the hashed password and returns a dummy token.
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const query = 'SELECT * FROM users WHERE username = ?';
  db.query(query, [username], async (err, results) => {
    if (err) {
      console.error('Error fetching user:', err);
      return res.status(500).json({ success: false, message: 'Server error while fetching user' });
    }
    if (results.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid username or password' });
    }
    const user = results[0];
    try {
      const isMatch = await bcrypt.compare(password, user.password);
      if (isMatch) {
        // Return a dummy token; replace with JWT later if needed.
        res.json({ success: true, message: 'Login successful', token: 'dummy-token' });
      } else {
        res.status(400).json({ success: false, message: 'Invalid username or password' });
      }
    } catch (compareError) {
      console.error('Error during password comparison:', compareError);
      res.status(500).json({ success: false, message: 'Error during password comparison' });
    }
  });
});

module.exports = router;
