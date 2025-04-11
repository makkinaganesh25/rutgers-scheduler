const express = require('express');
const db = require('../db'); // Assuming you set up a `db.js` for MySQL connection

const router = express.Router();

// Get all shifts
router.get('/', (req, res) => {
    const query = 'SELECT * FROM shifts';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching shifts:', err);
            res.status(500).send('Server error');
            return;
        }
        res.json(results);
    });
});

// Create a new shift
router.post('/', (req, res) => {
    const { date, start_time, end_time, assigned_user_id } = req.body;

    const query = 'INSERT INTO shifts (date, start_time, end_time, assigned_user_id) VALUES (?, ?, ?, ?)';
    db.query(query, [date, start_time, end_time, assigned_user_id], (err, result) => {
        if (err) {
            console.error('Error creating shift:', err);
            res.status(500).send('Server error');
            return;
        }
        res.json({ message: 'Shift created successfully', shiftId: result.insertId });
    });
});

module.exports = router;
