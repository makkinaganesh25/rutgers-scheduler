const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../db'); // Assuming you set up a `db.js` for MySQL connection

const router = express.Router();

// Register a new user
router.post('/register', async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const query = 'INSERT INTO users (username, password) VALUES (?, ?)';
    db.query(query, [username, hashedPassword], (err, result) => {
        if (err) {
            console.error('Error registering user:', err);
            res.status(500).send('Server error');
            return;
        }
        res.json({ message: 'User registered successfully', userId: result.insertId });
    });
});

// Login endpoint
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const query = 'SELECT * FROM users WHERE username = ?';
    db.query(query, [username], async (err, results) => {
        if (err) {
            res.status(500).json({ success: false, message: 'Server error while fetching user' });
            return;
        }
        if (results.length === 0) {
            res.status(400).json({ success: false, message: 'Invalid username or password' });
            return;
        }
        const user = results[0];
        try {
            const isMatch = await bcrypt.compare(password, user.password);
            if (isMatch) {
                res.json({ success: true, message: 'Login successful' });
            } else {
                res.status(400).json({ success: false, message: 'Invalid username or password' });
            }
        } catch (compareError) {
            res.status(500).json({ success: false, message: 'Error during password comparison' });
        }
    });
});

module.exports = router;
