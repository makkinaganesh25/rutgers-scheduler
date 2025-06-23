// File: backend/routes/csoLeave.js
const router = require('express').Router();
const db     = require('../db');
const auth   = require('../middleware/auth');

/**
 * POST   /api/cso/leave         – apply for leave
 * GET    /api/cso/leave         – list your leave requests
 * GET    /api/cso/leave/all     – list ALL requests (for supervisors)
 * PATCH  /api/cso/leave/:id     – approve/deny + free up shifts
 */

// 1) CSO: apply for leave
router.post('/', auth, async (req, res) => {
  const userId      = req.user.id;
  const { start_date, end_date } = req.body;

  try {
    const [ins] = await db.query(
      `INSERT INTO cso_leave_requests
         (user_id, start_date, end_date)
       VALUES (?, ?, ?)`,
      [userId, start_date, end_date]
    );
    res.json({ id: ins.insertId });
  } catch (err) {
    console.error('POST /api/cso/leave error', err);
    res.status(500).json({ error: 'Failed to create leave request' });
  }
});

// 2) CSO: list my requests
router.get('/', auth, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT * FROM cso_leave_requests
       WHERE user_id = ?
       ORDER BY requested_at DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    console.error('GET /api/cso/leave error', err);
    res.status(500).json({ error: 'Failed to fetch your leave requests' });
  }
});

// 3) Supervisor: list all requests
router.get('/all', auth, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT l.*, u.first_name, u.username
         FROM cso_leave_requests AS l
         JOIN users               AS u ON u.id = l.user_id
       ORDER BY l.requested_at ASC`
    );
    res.json(rows);
  } catch (err) {
    console.error('GET /api/cso/leave/all error', err);
    res.status(500).json({ error: 'Failed to fetch all leave requests' });
  }
});

// 4) Supervisor: approve or deny + free up shifts
router.patch('/:id', auth, async (req, res) => {
  const requestId = Number(req.params.id);
  const { status } = req.body;       // must be 'approved' or 'denied'
  const actorId    = req.user.id;

  if (!['approved','denied'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // a) Update the request status
    await conn.query(
      `UPDATE cso_leave_requests
         SET status = ?
       WHERE id = ?`,
      [status, requestId]
    );

    // b) Log the decision
    await conn.query(
      `INSERT INTO cso_leave_logs
         (request_id, acted_by, action)
       VALUES (?, ?, ?)`,
      [requestId, actorId, status]
    );

    // c) If it's approved, free up ALL that officer’s shifts in the window
    if (status === 'approved') {
      // 1) Re-read the leave window
      const [[lv]] = await conn.query(
        `SELECT user_id, start_date, end_date
           FROM cso_leave_requests
          WHERE id = ?`,
        [requestId]
      );

      // 2) Look up their username
      const [[u]] = await conn.query(
        `SELECT username
           FROM users
          WHERE id = ?`,
        [lv.user_id]
      );
      const username = u.username;

      // 3) Free any *regular* shifts (slot_id IS NULL)
      await conn.query(
        `UPDATE shifts
           SET officer_name = NULL,
               status       = 'open'
         WHERE officer_name = ?
           AND date BETWEEN ? AND ?
           AND slot_id IS NULL`,
        [username, lv.start_date, lv.end_date]
      );

      // 4) Free any *event-slot* shifts **and** clear their slots
      await conn.query(
        `UPDATE event_slots    AS es
           JOIN shifts          AS s
             ON s.slot_id = es.id
         SET es.filled_by   = NULL,
             es.filled_at   = NULL,
             s.officer_name = NULL,
             s.status       = 'open'
         WHERE s.officer_name = ?
           AND s.date BETWEEN ? AND ?`,
        [username, lv.start_date, lv.end_date]
      );
    }

    await conn.commit();
    res.json({ success: true });

  } catch (err) {
    await conn.rollback();
    console.error('PATCH /api/cso/leave/:id error', err);
    res.status(500).json({ error: 'Server error' });
  } finally {
    conn.release();
  }
});

module.exports = router;
