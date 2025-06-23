// backend/routes/securityLeave.js
const router = require('express').Router();
const db     = require('../db');  // your mysql pool/connection module

// 1) Apply for leave (SO & SLT)
router.post('/', async (req, res) => {
  try {
    const officerId = req.user.securityOfficerId;  // set from your auth middleware
    const { start_date, end_date } = req.body;
    const { insertId } = await db.query(
      `INSERT INTO security_leave_requests
         (officer_id, start_date, end_date)
       VALUES (?,?,?)`,
      [officerId, start_date, end_date]
    );
    res.json({ id: insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create leave request.' });
  }
});

// 2) List my requests (SO & SLT)
router.get('/', async (req, res) => {
  try {
    const officerId = req.user.securityOfficerId;
    const rows = await db.query(
      `SELECT * FROM security_leave_requests WHERE officer_id=? ORDER BY requested_at DESC`,
      [officerId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch your leave requests.' });
  }
});

// 3) Approve/Deny (LT only)
router.patch('/:id', async (req, res) => {
  try {
    // your auth middleware must have already enforced user_rank==='LT'
    const { status } = req.body; // 'approved' or 'denied'
    await db.query(
      `UPDATE security_leave_requests SET status=? WHERE id=?`,
      [status, req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not update leave request.' });
  }
});

module.exports = router;
