// // File: backend/routes/eventSlots.js
// const express = require('express');
// const db      = require('../db');
// const auth    = require('../middleware/auth');

// const router = express.Router({ mergeParams: true });
// router.use(auth);

// // GET /api/events/:id/slots
// router.get('/', async (req, res) => {
//   const eventId = req.params.id;
//   const [rows] = await db.query(
//     `SELECT 
//        s.id,
//        s.assignment,
//        s.time_in,
//        s.time_out,
//        s.filled_by,
//        u.first_name AS filled_name
//      FROM event_slots s
//      LEFT JOIN users u ON u.id = s.filled_by
//      WHERE s.event_id = ?
//      ORDER BY s.id`,
//     [eventId]
//   );
//   res.json(rows);
// });

// // POST /api/events/:id/slots/:slotId/claim
// router.post('/:slotId/claim', async (req, res) => {
//   const userId = req.user.id;
//   const slotId = req.params.slotId;
//   const [result] = await db.query(
//     `UPDATE event_slots
//         SET filled_by = ?, filled_at = NOW()
//       WHERE id = ? AND filled_by IS NULL`,
//     [userId, slotId]
//   );
//   if (result.affectedRows === 0) {
//     return res.status(409).json({ error: 'Already claimed' });
//   }
//   res.json({ success: true });
// });

// module.exports = router;
// const express = require('express');
// const db      = require('../db');
// const auth    = require('../middleware/auth');

// const router = express.Router({ mergeParams: true });
// router.use(auth);

// /** Convert "HHMM" → "HH:MM:00" for MySQL TIME columns */
// function parseHHMM(val) {
//   if (/^\d{4}$/.test(val)) {
//     const hh = val.slice(0, 2);
//     const mm = val.slice(2, 4);
//     return `${hh}:${mm}:00`;
//   }
//   return val; // assume already "HH:MM:SS"
// }

// // GET /api/events/:id/slots
// router.get('/', async (req, res) => {
//   try {
//     const eventId = req.params.id;
//     const [rows] = await db.query(
//       `SELECT
//          s.id,
//          s.assignment,
//          s.time_in,
//          s.time_out,
//          s.filled_by,
//          u.username AS filled_name
//        FROM event_slots AS s
//        LEFT JOIN users AS u
//          ON u.id = s.filled_by
//        WHERE s.event_id = ?
//        ORDER BY s.id`,
//       [eventId]
//     );
//     res.json(rows);
//   } catch (err) {
//     console.error('GET /api/events/:id/slots error', err);
//     res.status(500).json({ error: err.message });
//   }
// });

// // POST /api/events/:id/slots/:slotId/claim
// // — mark slot filled AND create a new shift row
// router.post('/:slotId/claim', async (req, res) => {
//   const userId   = req.user.id;
//   const username = req.user.username;
//   const slotId   = req.params.slotId;

//   const conn = await db.getConnection();
//   try {
//     await conn.beginTransaction();

//     // 1) mark the slot
//     const [r1] = await conn.query(
//       `UPDATE event_slots
//          SET filled_by = ?, filled_at = NOW()
//        WHERE id = ? AND filled_by IS NULL`,
//       [userId, slotId]
//     );
//     if (r1.affectedRows === 0) {
//       await conn.rollback();
//       return res.status(409).json({ error: 'Already claimed' });
//     }

//     // 2) fetch that slot + its parent event date
//     const [[slot]] = await conn.query(
//       `SELECT
//          s.assignment,
//          s.time_in,
//          s.time_out,
//          e.date AS evt_date
//        FROM event_slots AS s
//        JOIN events       AS e
//          ON e.id = s.event_id
//        WHERE s.id = ?`,
//       [slotId]
//     );

//     // 3) insert into shifts, converting "HHMM" → proper TIME
//     const [shiftResult] = await conn.query(
//       `INSERT INTO shifts
//          (shift_type, date, start_time, end_time,
//           officer_name, status)
//        VALUES (?, ?, ?, ?, ?, 'assigned')`,
//       [
//         slot.assignment,                   // shift_type
//         slot.evt_date,                     // date
//         parseHHMM(slot.time_in),           // start_time
//         parseHHMM(slot.time_out),          // end_time
//         username                           // officer_name
//       ]
//     );

//     await conn.commit();
//     res.json({
//       success: true,
//       shiftId: shiftResult.insertId
//     });
//   } catch (err) {
//     await conn.rollback();
//     console.error('POST /api/events/:id/slots/:slotId/claim error', err);
//     res.status(500).json({ error: err.message });
//   } finally {
//     conn.release();
//   }
// });

// module.exports = router;


// File: backend/routes/eventSlots.js
const express = require('express');
const db      = require('../db');
const auth    = require('../middleware/auth');

const router = express.Router({ mergeParams: true });

/** 
 * GET /api/events/:id/slots
 * — list all slots for event :id
 */
router.get('/', auth, async (req, res) => {
  try {
    const eventId = req.params.id;
    const [rows] = await db.query(
      `SELECT
         s.id,
         s.assignment,
         s.time_in,
         s.time_out,
         s.filled_by,
         u.username AS filled_name
       FROM event_slots AS s
       LEFT JOIN users AS u
         ON u.id = s.filled_by
       WHERE s.event_id = ?
       ORDER BY s.id`,
      [eventId]
    );
    res.json(rows);
  } catch (err) {
    console.error('GET /api/events/:id/slots error', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/events/:id/slots/:slotId/claim
 * — claim the slot + insert into `shifts` (with slot_id FK)
 */
router.post('/:slotId/claim', auth, async (req, res) => {
  const userId   = req.user.id;
  const username = req.user.username;
  const slotId   = +req.params.slotId;

  // helper: "0730" → "07:30:00"
  function parseHHMM(val) {
    return /^\d{4}$/.test(val)
      ? `${val.slice(0,2)}:${val.slice(2,4)}:00`
      : val;
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // 1) mark the slot as claimed
    const [r1] = await conn.query(
      `UPDATE event_slots
         SET filled_by = ?, filled_at = NOW()
       WHERE id = ? AND filled_by IS NULL`,
      [userId, slotId]
    );
    if (r1.affectedRows === 0) {
      await conn.rollback();
      return res.status(409).json({ error: 'Already claimed' });
    }

    // 2) fetch slot + event date
    const [[slot]] = await conn.query(
      `SELECT
         s.assignment,
         s.time_in,
         s.time_out,
         e.date AS evt_date
       FROM event_slots AS s
       JOIN events       AS e
         ON e.id = s.event_id
       WHERE s.id = ?`,
      [slotId]
    );

    // 3) insert into shifts, now with slot_id
    const [shiftRes] = await conn.query(
      `INSERT INTO shifts
         (slot_id, shift_type, date, start_time, end_time,
          officer_name, status)
       VALUES (?, ?, ?, ?, ?, ?, 'assigned')`,
      [
        slotId,
        slot.assignment,
        slot.evt_date,
        parseHHMM(slot.time_in),
        parseHHMM(slot.time_out),
        username
      ]
    );

    await conn.commit();
    res.json({ success: true, shiftId: shiftRes.insertId });
  } catch (err) {
    await conn.rollback();
    console.error('POST /api/events/:id/slots/:slotId/claim error', err);
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});

module.exports = router;
