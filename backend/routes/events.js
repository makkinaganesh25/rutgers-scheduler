// // backend/routes/events.js
// const express = require('express');
// const db      = require('../db');
// const auth    = require('../middleware/auth');

// const router = express.Router();
// router.use(auth);

// // 1) Create a new event
// // POST /api/events → { id }
// router.post('/', async (req, res) => {
//   try {
//     const { name, date, description, capacity } = req.body;
//     const createdBy = req.user.id;
//     const [result] = await db.query(
//       `INSERT INTO events
//          (name, date, description, capacity, created_by)
//        VALUES (?, ?, ?, ?, ?)`,
//       [name, date, description, capacity, createdBy]
//     );
//     if (!result.insertId) {
//       return res.status(500).json({ error: 'No insertId returned' });
//     }
//     res.json({ id: result.insertId });
//   } catch (err) {
//     console.error('POST /api/events error', err);
//     res.status(500).json({ error: err.message });
//   }
// });

// // 2) List all events
// // GET /api/events → [ {id,name,date,description,capacity,created_by,created_at}, … ]
// router.get('/', async (req, res) => {
//   try {
//     const [rows] = await db.query(
//       `SELECT * FROM events ORDER BY date DESC`
//     );
//     res.json(rows);
//   } catch (err) {
//     console.error('GET /api/events error', err);
//     res.status(500).json({ error: err.message });
//   }
// });

// // 3) Get one event + its slots
// // GET /api/events/:id → { event, slots }
// router.get('/:id', async (req, res) => {
//   try {
//     const eventId = req.params.id;
//     const [events] = await db.query(
//       `SELECT * FROM events WHERE id = ?`,
//       [eventId]
//     );
//     if (!events.length) {
//       return res.status(404).json({ error: 'Event not found' });
//     }
//     const event = events[0];

//     const [slots] = await db.query(
//       `SELECT
//          s.id,
//          s.assignment,
//          s.time_in,
//          s.time_out,
//          s.filled_by,
//          u.username AS filled_name
//        FROM event_slots s
//        LEFT JOIN users u
//          ON u.id = s.filled_by
//        WHERE s.event_id = ?
//        ORDER BY s.id`,
//       [eventId]
//     );

//     res.json({ event, slots });
//   } catch (err) {
//     console.error('GET /api/events/:id error', err);
//     res.status(500).json({ error: err.message });
//   }
// });

// // 4) Bulk-add slots to an event
// // POST /api/events/:id/slots → { success: true }
// router.post('/:id/slots', async (req, res) => {
//   try {
//     const eventId = req.params.id;
//     const slots   = req.body.slots || [];
//     const values  = slots.map(s => [
//       eventId,
//       s.assignment,
//       s.time_in,
//       s.time_out
//     ]);
//     await db.query(
//       `INSERT INTO event_slots
//          (event_id, assignment, time_in, time_out)
//        VALUES ?`,
//       [values]
//     );
//     res.json({ success: true });
//   } catch (err) {
//     console.error('POST /api/events/:id/slots error', err);
//     res.status(500).json({ error: err.message });
//   }
// });

// // 5) List slots for an event
// // GET /api/events/:id/slots → [ {id,assignment,time_in,time_out,filled_by,filled_name}, … ]
// router.get('/:id/slots', async (req, res) => {
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
//        FROM event_slots s
//        LEFT JOIN users u
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

// // 6) Claim a slot
// // POST /api/events/:id/slots/:slotId/claim → { success: true }
// router.post('/:id/slots/:slotId/claim', async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const slotId = req.params.slotId;
//     const [result] = await db.query(
//       `UPDATE event_slots
//          SET filled_by = ?, filled_at = NOW()
//        WHERE id = ? AND filled_by IS NULL`,
//       [userId, slotId]
//     );
//     if (result.affectedRows === 0) {
//       return res.status(409).json({ error: 'Already claimed' });
//     }
//     res.json({ success: true });
//   } catch (err) {
//     console.error('POST /api/events/:id/slots/:slotId/claim error', err);
//     res.status(500).json({ error: err.message });
//   }
// });

// module.exports = router;
// ----------------------------------------------------------------------------------
// const express = require('express');
// const db      = require('../db');
// const auth    = require('../middleware/auth');

// const router = express.Router();
// router.use(auth);

// // POST /api/events → { id }
// router.post('/', async (req, res) => {
//   try {
//     const { name, date, description, capacity } = req.body;
//     const createdBy = req.user.id;
//     const [result] = await db.query(
//       `INSERT INTO events
//          (name, date, description, capacity, created_by)
//        VALUES (?, ?, ?, ?, ?)`,
//       [name, date, description, capacity, createdBy]
//     );
//     res.json({ id: result.insertId });
//   } catch (err) {
//     console.error('POST /api/events error', err);
//     res.status(500).json({ error: err.message });
//   }
// });

// // POST /api/events/:id/slots → { success }
// router.post('/:id/slots', async (req, res) => {
//   try {
//     const eventId = req.params.id;
//     const slots   = req.body.slots || [];
//     const values  = slots.map(s => [
//       eventId,
//       s.assignment,
//       s.time_in,
//       s.time_out
//     ]);
//     await db.query(
//       `INSERT INTO event_slots
//          (event_id, assignment, time_in, time_out)
//        VALUES ?`,
//       [values]
//     );
//     res.json({ success: true });
//   } catch (err) {
//     console.error('POST /api/events/:id/slots error', err);
//     res.status(500).json({ error: err.message });
//   }
// });

// // GET /api/events → [ … ]
// router.get('/', async (req, res) => {
//   try {
//     const [rows] = await db.query(
//       `SELECT
//          id,
//          name,
//          DATE_FORMAT(date,'%Y-%m-%d') AS date,
//          description,
//          capacity
//        FROM events
//        ORDER BY date DESC`
//     );
//     res.json(rows);
//   } catch (err) {
//     console.error('GET /api/events error', err);
//     res.status(500).json({ error: err.message });
//   }
// });

// // GET /api/events/:id → { event, slots }
// router.get('/:id', async (req, res) => {
//   try {
//     const eventId = req.params.id;
//     const [events] = await db.query(
//       `SELECT
//          id,
//          name,
//          DATE_FORMAT(date,'%Y-%m-%d') AS date,
//          description,
//          capacity
//        FROM events
//        WHERE id = ?`,
//       [eventId]
//     );
//     if (!events.length) {
//       return res.status(404).json({ error: 'Event not found' });
//     }
//     const event = events[0];

//     const [slots] = await db.query(
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
//     res.json({ event, slots });
//   } catch (err) {
//     console.error('GET /api/events/:id error', err);
//     res.status(500).json({ error: err.message });
//   }
// });

// module.exports = router;
//-----------------------------------------------------------------------------------
//working so far.
// // File: backend/routes/events.js
// const express = require('express');
// const db      = require('../db');
// const auth    = require('../middleware/auth');

// const router = express.Router();

// // helper middleware to restrict to LT/BS/CS roles:
// function requireEventCreator(req, res, next) {
//   const rank = req.user.user_rank;
//   if (!['LT','BS','CS'].includes(rank)) {
//     return res.status(403).json({ error: 'Forbidden' });
//   }
//   next();
// }

// /**
//  * GET /api/events
//  * — any authenticated user
//  */
// router.get('/', auth, async (req, res) => {
//   try {
//     const [rows] = await db.query(
//       `SELECT
//          id,
//          name,
//          DATE_FORMAT(date,'%Y-%m-%d') AS date,
//          description,
//          capacity
//        FROM events
//        ORDER BY date DESC`
//     );
//     res.json(rows);
//   } catch (err) {
//     console.error('GET /api/events error', err);
//     res.status(500).json({ error: err.message });
//   }
// });

// /**
//  * GET /api/events/:id
//  * — any authenticated user
//  */
// router.get('/:id', auth, async (req, res) => {
//   try {
//     const eventId = req.params.id;

//     // 1) fetch the event
//     const [[eventRow]] = await db.query(
//       `SELECT
//          id,
//          name,
//          DATE_FORMAT(date,'%Y-%m-%d') AS date,
//          description,
//          capacity
//        FROM events
//        WHERE id = ?`,
//       [eventId]
//     );
//     if (!eventRow) {
//       return res.status(404).json({ error: 'Event not found' });
//     }

//     // 2) fetch its slots (with filled_name)
//     const [slots] = await db.query(
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

//     res.json({ event: eventRow, slots });
//   } catch (err) {
//     console.error('GET /api/events/:id error', err);
//     res.status(500).json({ error: err.message });
//   }
// });

// /**
//  * POST /api/events
//  * — only LT/BS/CS
//  */
// router.post('/', auth, requireEventCreator, async (req, res) => {
//   try {
//     const { name, date, description, capacity } = req.body;
//     const createdBy = req.user.id;
//     const [result] = await db.query(
//       `INSERT INTO events
//          (name, date, description, capacity, created_by)
//        VALUES (?, ?, ?, ?, ?)`,
//       [name, date, description, capacity, createdBy]
//     );
//     res.json({ id: result.insertId });
//   } catch (err) {
//     console.error('POST /api/events error', err);
//     res.status(500).json({ error: err.message });
//   }
// });

// /**
//  * POST /api/events/:id/slots
//  * — bulk-add slots; only LT/BS/CS
//  */
// router.post('/:id/slots', auth, requireEventCreator, async (req, res) => {
//   try {
//     const eventId = req.params.id;
//     const slots   = req.body.slots || [];
//     const values  = slots.map(s => [
//       eventId,
//       s.assignment,
//       s.time_in,
//       s.time_out
//     ]);

//     await db.query(
//       `INSERT INTO event_slots
//          (event_id, assignment, time_in, time_out)
//        VALUES ?`,
//       [values]
//     );
//     res.json({ success: true });
//   } catch (err) {
//     console.error('POST /api/events/:id/slots error', err);
//     res.status(500).json({ error: err.message });
//   }
// });

// // File: backend/routes/events.js

// /**
//  * DELETE /api/events/:id
//  * — only LT/BS/CS
//  */
// router.delete('/:id', auth, requireEventCreator, async (req, res) => {
//     try {
//       const [result] = await db.query(
//         'DELETE FROM events WHERE id = ?',
//         [req.params.id]
//       );
//       if (!result.affectedRows) {
//         return res.status(404).json({ error: 'Event not found' });
//       }
//       // event_slots and shifts are auto-deleted by ON DELETE CASCADE
//       res.json({ success: true });
//     } catch (err) {
//       console.error('DELETE /api/events/:id error', err);
//       res.status(500).json({ error: err.message });
//     }
//   });
  

// module.exports = router;
//---------------------------------------------

// // File: backend/routes/events.js
// const express = require('express');
// const db      = require('../db');
// const auth    = require('../middleware/auth');

// const router = express.Router();

// // middleware: only LT/BS/CS can create/update/delete
// function requireEventCreator(req, res, next) {
//   const rank = req.user.user_rank;
//   if (!['LT','BS','CS'].includes(rank)) {
//     return res.status(403).json({ error: 'Forbidden' });
//   }
//   next();
// }

// /**
//  * GET /api/events
//  * — any authenticated user
//  */
// router.get('/', auth, async (req, res) => {
//   try {
//     const [rows] = await db.query(
//       `SELECT
//          id,
//          name,
//          DATE_FORMAT(date,'%Y-%m-%d') AS date,
//          description,
//          capacity
//        FROM events
//        ORDER BY date DESC`
//     );
//     res.json(rows);
//   } catch (err) {
//     console.error('GET /api/events', err);
//     res.status(500).json({ error: err.message });
//   }
// });

// /**
//  * GET /api/events/:id
//  * — any authenticated user
//  */
// router.get('/:id', auth, async (req, res) => {
//   try {
//     const eventId = req.params.id;
//     const [[eventRow]] = await db.query(
//       `SELECT
//          id,
//          name,
//          DATE_FORMAT(date,'%Y-%m-%d') AS date,
//          description,
//          capacity
//        FROM events
//        WHERE id = ?`,
//       [eventId]
//     );
//     if (!eventRow) {
//       return res.status(404).json({ error: 'Event not found' });
//     }

//     const [slots] = await db.query(
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

//     res.json({ event: eventRow, slots });
//   } catch (err) {
//     console.error('GET /api/events/:id', err);
//     res.status(500).json({ error: err.message });
//   }
// });

// /**
//  * POST /api/events
//  * — only LT/BS/CS
//  */
// router.post('/', auth, requireEventCreator, async (req, res) => {
//   try {
//     const { name, date, description, capacity } = req.body;
//     const createdBy = req.user.id;
//     const [result] = await db.query(
//       `INSERT INTO events
//          (name, date, description, capacity, created_by)
//        VALUES (?, ?, ?, ?, ?)`,
//       [name, date, description, capacity, createdBy]
//     );
//     res.json({ id: result.insertId });
//   } catch (err) {
//     console.error('POST /api/events', err);
//     res.status(500).json({ error: err.message });
//   }
// });

// /**
//  * POST /api/events/:id/slots
//  * — bulk-add slots; only LT/BS/CS
//  */
// router.post('/:id/slots', auth, requireEventCreator, async (req, res) => {
//   try {
//     const eventId = req.params.id;
//     const slots   = req.body.slots || [];
//     const values  = slots.map(s => [
//       eventId,
//       s.assignment,
//       s.time_in,
//       s.time_out
//     ]);
//     await db.query(
//       `INSERT INTO event_slots
//          (event_id, assignment, time_in, time_out)
//        VALUES ?`,
//       [values]
//     );
//     res.json({ success: true });
//   } catch (err) {
//     console.error('POST /api/events/:id/slots', err);
//     res.status(500).json({ error: err.message });
//   }
// });

// /**
//  * PUT /api/events/:id
//  * — update event metadata; only LT/BS/CS
//  */
// router.put('/:id', auth, requireEventCreator, async (req, res) => {
//   try {
//     const { name, date, description, capacity } = req.body;
//     const [result] = await db.query(
//       `UPDATE events
//          SET name = ?, date = ?, description = ?, capacity = ?
//        WHERE id = ?`,
//       [name, date, description, capacity, req.params.id]
//     );
//     if (!result.affectedRows) {
//       return res.status(404).json({ error: 'Event not found' });
//     }
//     res.json({ success: true });
//   } catch (err) {
//     console.error('PUT /api/events/:id', err);
//     res.status(500).json({ error: err.message });
//   }
// });

// /**
//  * PATCH /api/events/:eid/slots/:sid
//  * — update a single slot; only LT/BS/CS
//  */
// router.patch('/:eid/slots/:sid', auth, requireEventCreator, async (req, res) => {
//   try {
//     const { assignment, time_in, time_out } = req.body;
//     const [result] = await db.query(
//       `UPDATE event_slots
//          SET assignment = ?, time_in = ?, time_out = ?
//        WHERE id = ? AND event_id = ?`,
//       [assignment, time_in, time_out, req.params.sid, req.params.eid]
//     );
//     if (!result.affectedRows) {
//       return res.status(404).json({ error: 'Slot not found' });
//     }
//     res.json({ success: true });
//   } catch (err) {
//     console.error('PATCH /api/events/:eid/slots/:sid', err);
//     res.status(500).json({ error: err.message });
//   }
// });

// /**
//  * DELETE /api/events/:id
//  * — only LT/BS/CS; cascades slots via FK ON DELETE CASCADE
//  */
// router.delete('/:id', auth, requireEventCreator, async (req, res) => {
//   try {
//     const [result] = await db.query(
//       `DELETE FROM events WHERE id = ?`,
//       [req.params.id]
//     );
//     if (!result.affectedRows) {
//       return res.status(404).json({ error: 'Event not found' });
//     }
//     res.json({ success: true });
//   } catch (err) {
//     console.error('DELETE /api/events/:id', err);
//     res.status(500).json({ error: err.message });
//   }
// });

// module.exports = router;

//---------------------------------------------------------

// backend/routes/events.js
const express = require('express');
const db      = require('../db');
const auth    = require('../middleware/auth');

const router = express.Router();

// only LT/BS/CS can create, update, delete
function requireEventCreator(req, res, next) {
  const rank = req.user.user_rank;
  if (!['LT','BS','CS'].includes(rank)) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
}

// 1) GET all events
router.get('/', auth, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT
         id,
         name,
         DATE_FORMAT(date,'%Y-%m-%d') AS date,
         description,
         capacity
       FROM events
       ORDER BY date DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error('GET /api/events error', err);
    res.status(500).json({ error: err.message });
  }
});

// 2) GET one event + its slots (including who filled them)
router.get('/:id', auth, async (req, res) => {
  try {
    const eventId = req.params.id;

    // fetch event
    const [[eventRow]] = await db.query(
      `SELECT
         id,
         name,
         DATE_FORMAT(date,'%Y-%m-%d') AS date,
         description,
         capacity
       FROM events
       WHERE id = ?`,
      [eventId]
    );
    if (!eventRow) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // fetch slots + user who filled
    const [slots] = await db.query(
      `SELECT
         s.id,
         s.assignment,
         s.time_in,
         s.time_out,
         s.filled_by,
         u.username    AS filled_name,
         u.user_rank   AS filled_rank
       FROM event_slots AS s
       LEFT JOIN users AS u
         ON u.id = s.filled_by
       WHERE s.event_id = ?
       ORDER BY s.id`,
      [eventId]
    );

    res.json({ event: eventRow, slots });
  } catch (err) {
    console.error('GET /api/events/:id error', err);
    res.status(500).json({ error: err.message });
  }
});

// 3) POST create new event
router.post('/', auth, requireEventCreator, async (req, res) => {
  try {
    const { name, date, description, capacity } = req.body;
    const createdBy = req.user.id;
    const [result] = await db.query(
      `INSERT INTO events
         (name, date, description, capacity, created_by)
       VALUES (?, ?, ?, ?, ?)`,
      [name, date, description, capacity, createdBy]
    );
    res.json({ id: result.insertId });
  } catch (err) {
    console.error('POST /api/events error', err);
    res.status(500).json({ error: err.message });
  }
});

// 4) POST bulk‐add slots to an event
router.post('/:id/slots', auth, requireEventCreator, async (req, res) => {
  try {
    const eventId = req.params.id;
    const slots   = req.body.slots || [];
    const values  = slots.map(s => [
      eventId,
      s.assignment,
      s.time_in,
      s.time_out
    ]);
    await db.query(
      `INSERT INTO event_slots
         (event_id, assignment, time_in, time_out)
       VALUES ?`,
      [values]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('POST /api/events/:id/slots error', err);
    res.status(500).json({ error: err.message });
  }
});

// 5) PATCH update event metadata
router.patch('/:id', auth, requireEventCreator, async (req, res) => {
  try {
    const { name, date, description, capacity } = req.body;
    await db.query(
      `UPDATE events
         SET name = ?, date = ?, description = ?, capacity = ?
       WHERE id = ?`,
      [name, date, description, capacity, req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('PATCH /api/events/:id error', err);
    res.status(500).json({ error: err.message });
  }
});

// 6) PATCH update a single slot
router.patch('/:id/slots/:slotId', auth, requireEventCreator, async (req, res) => {
  try {
    const { assignment, time_in, time_out } = req.body;
    await db.query(
      `UPDATE event_slots
         SET assignment = ?, time_in = ?, time_out = ?
       WHERE id = ? AND event_id = ?`,
      [assignment, time_in, time_out, req.params.slotId, req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('PATCH /api/events/:id/slots/:slotId error', err);
    res.status(500).json({ error: err.message });
  }
});

// 7) DELETE an event (cascades slots)
router.delete('/:id', auth, requireEventCreator, async (req, res) => {
  try {
    const [result] = await db.query(
      `DELETE FROM events WHERE id = ?`,
      [req.params.id]
    );
    if (!result.affectedRows) {
      return res.status(404).json({ error: 'Event not found' });
    }
    // event_slots should be ON DELETE CASCADE
    res.json({ success: true });
  } catch (err) {
    console.error('DELETE /api/events/:id error', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
