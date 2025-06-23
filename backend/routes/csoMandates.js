// // File: backend/routes/csoMandates.js
// const router = require('express').Router();
// const db     = require('../db');
// const auth   = require('../middleware/auth');

// // compute hours between two HH:MM:SS strings
// function diffHours(start, end) {
//   return (new Date(`1970-01-01T${end}Z`) - new Date(`1970-01-01T${start}Z`)) / 36e5;
// }

// /**
//  * GET /api/cso/mandates/availability
//  *   • ?shiftId=123  → leave replacement
//  *   • ?slotId=456   → special-event slot
//  */
// router.get('/availability', auth, async (req, res) => {
//   let date, start_time, end_time;

//   try {
//     if (req.query.shiftId) {
//       // ── leave replacement ──
//       const sid = +req.query.shiftId;
//       const [[shift]] = await db.query(
//         `SELECT date, start_time, end_time
//            FROM shifts
//           WHERE id = ?`,
//         [sid]
//       );
//       if (!shift) return res.status(404).json({ error:'Shift not found' });
//       ({ date, start_time, end_time } = shift);

//     } else if (req.query.slotId) {
//       // ── special-event slot ──
//       const slotId = +req.query.slotId;
//       const [[slot]] = await db.query(
//         `SELECT
//            e.date      AS date,
//            s.time_in   AS raw_start,
//            s.time_out  AS raw_end
//          FROM event_slots s
//          JOIN events       e ON e.id = s.event_id
//         WHERE s.id = ?`,
//         [slotId]
//       );
//       if (!slot) return res.status(404).json({ error:'Slot not found' });

//       date = slot.date;

//       // normalize "0900" → "09:00:00" (so our overlap-QUERY works)
//       const rs = slot.raw_start;
//       const re = slot.raw_end;
//       start_time = /^\d{4}$/.test(rs)
//         ? `${rs.slice(0,2)}:${rs.slice(2,4)}:00`
//         : rs;
//       end_time = /^\d{4}$/.test(re)
//         ? `${re.slice(0,2)}:${re.slice(2,4)}:00`
//         : re;

//     } else {
//       return res.status(400).json({ error:'shiftId or slotId required' });
//     }

//     // fetch all active CSO officers
//     const CSO_RANKS = ['CDT','CSO','FTO','XO','CS','BS'];
//     const [candidates] = await db.query(
//       `SELECT id, username, first_name, user_rank
//          FROM users
//         WHERE user_rank IN (?)
//           AND status = 'active'`,
//       [CSO_RANKS]
//     );

//     // conflict filters
//     const available = [];
//     for (let u of candidates) {
//       // 1) overlap?
//       const [ov] = await db.query(
//         `SELECT 1 FROM shifts
//            WHERE officer_name = ?
//              AND date = ?
//              AND NOT (
//                end_time <= ? OR start_time >= ?
//              )`,
//         [u.username, date, start_time, end_time]
//       );
//       if (ov.length) continue;

//       // 2) max 16 hrs / day?
//       const [dayShifts] = await db.query(
//         `SELECT start_time,end_time
//            FROM shifts
//           WHERE officer_name = ? AND date = ?`,
//         [u.username, date]
//       );
//       const totalHrs = dayShifts.reduce(
//         (sum, s) => sum + diffHours(s.start_time, s.end_time),
//         0
//       ) + diffHours(start_time, end_time);
//       if (totalHrs > 16) continue;

//       // 3) on approved leave?
//       const [lv] = await db.query(
//         `SELECT 1 FROM cso_leave_requests
//            WHERE user_id = ?
//              AND status = 'approved'
//              AND start_date <= ?
//              AND end_date   >= ?`,
//         [u.id, date, date]
//       );
//       if (lv.length) continue;

//       available.push(u);
//     }

//     return res.json(available);

//   } catch (err) {
//     console.error('GET /api/cso/mandates/availability error:', err);
//     return res.status(500).json({ error:'Server error' });
//   }
// });

// /**
//  * POST /api/cso/mandates
//  * Body: { officerId, reason?, plus exactly one of shiftId or slotId }
//  */
// router.post('/', auth, async (req, res) => {
//   const { shiftId, slotId, officerId, reason } = req.body;
//   if (!officerId || !(shiftId || slotId)) {
//     return res.status(400).json({
//       error:'Must supply officerId plus shiftId or slotId'
//     });
//   }

//   const mandator = req.user.id;
//   const conn = await db.getConnection();

//   try {
//     await conn.beginTransaction();

//     // 1) figure out date/start/end/type
//     let date, start_time, end_time, shift_type, newShiftId;
//     if (shiftId) {
//       const [[sh]] = await conn.query(
//         `SELECT date,start_time,end_time,shift_type
//            FROM shifts WHERE id = ?`,
//         [shiftId]
//       );
//       if (!sh) throw { status:404, error:'Shift not found' };
//       ({ date, start_time, end_time, shift_type } = sh);

//     } else {
//       const sid = +slotId;
//       const [[sl]] = await conn.query(
//         `SELECT
//            s.assignment AS shift_type,
//            s.time_in    AS raw_start,
//            s.time_out   AS raw_end,
//            e.date       AS date
//          FROM event_slots s
//          JOIN events       e ON e.id = s.event_id
//         WHERE s.id = ?`,
//         [sid]
//       );
//       if (!sl) throw { status:404, error:'Slot not found' };

//       shift_type = sl.shift_type;
//       date       = sl.date;
//       // normalize times again
//       start_time = /^\d{4}$/.test(sl.raw_start)
//         ? `${sl.raw_start.slice(0,2)}:${sl.raw_start.slice(2)}:00`
//         : sl.raw_start;
//       end_time = /^\d{4}$/.test(sl.raw_end)
//         ? `${sl.raw_end.slice(0,2)}:${sl.raw_end.slice(2)}:00`
//         : sl.raw_end;
//     }

//     // 2) load username
//     const [[urow]] = await conn.query(
//       `SELECT username FROM users WHERE id = ?`,
//       [officerId]
//     );
//     if (!urow) throw { status:404, error:'Officer not found' };
//     const username = urow.username;

//     // 3) run the exact same 3 checks
//     {
//       const [ov] = await conn.query(
//         `SELECT 1 FROM shifts
//            WHERE officer_name=? AND date=?
//              AND NOT (end_time <= ? OR start_time >= ?)`,
//         [username, date, start_time, end_time]
//       );
//       if (ov.length) throw { status:409, error:'Overlap' };
//     }
//     {
//       const [dayRows] = await conn.query(
//         `SELECT start_time,end_time
//            FROM shifts WHERE officer_name=? AND date=?`,
//         [username, date]
//       );
//       const tot = dayRows.reduce(
//         (sum,s) => sum + diffHours(s.start_time,s.end_time),
//         0
//       ) + diffHours(start_time,end_time);
//       if (tot > 16) throw { status:409, error:'MaxHoursExceeded' };
//     }
//     {
//       const [lv] = await conn.query(
//         `SELECT 1 FROM cso_leave_requests
//            WHERE user_id=? AND status='approved'
//              AND start_date<=? AND end_date>=?`,
//         [officerId, date, date]
//       );
//       if (lv.length) throw { status:409, error:'OnLeave' };
//     }

//     // 4) write back
//     if (shiftId) {
//       // reassign existing shift
//       await conn.query(
//         `UPDATE shifts
//            SET officer_name=?, status='assigned'
//          WHERE id=?`,
//         [username, shiftId]
//       );
//       newShiftId = shiftId;

//     } else {
//       // claim slot + insert shift
//       const sid = +slotId;
//       const [r1] = await conn.query(
//         `UPDATE event_slots
//            SET filled_by=?, filled_at=NOW()
//          WHERE id=? AND filled_by IS NULL`,
//         [officerId, sid]
//       );
//       if (!r1.affectedRows) throw { status:409, error:'Slot already filled' };

//       const [ins] = await conn.query(
//         `INSERT INTO shifts
//            (slot_id, shift_type, date, start_time, end_time, officer_name, status)
//          VALUES (?, ?, ?, ?, ?, ?, 'assigned')`,
//         [sid, shift_type, date, start_time, end_time, username]
//       );
//       newShiftId = ins.insertId;
//     }

//     // 5) audit
//     await conn.query(
//       `INSERT INTO cso_mandate_assignments
//          (shift_id, mandated_by, mandated_officer, reason)
//        VALUES (?,?,?,?)`,
//       [newShiftId, mandator, officerId, reason||null]
//     );

//     await conn.commit();
//     return res.json({ success:true, shiftId:newShiftId });

//   } catch (err) {
//     await conn.rollback();
//     console.error('POST /api/cso/mandates error:', err);
//     return res.status(err.status||500).json({ error: err.error||'Server error' });
//   } finally {
//     conn.release();
//   }
// });

// module.exports = router;

// backend/routes/csoMandates.js
const router = require('express').Router();
const db     = require('../db');
const auth   = require('../middleware/auth');

// diff in hours between two "HH:MM:SS" strings
function diffHours(start, end) {
  return (new Date(`1970-01-01T${end}Z`) - new Date(`1970-01-01T${start}Z`)) / 36e5;
}

/**
 * GET /api/cso/mandates/availability
 *   • ?shiftId=123  → leave replacement
 *   • ?slotId=456   → special-event slot
 */
router.get('/availability', auth, async (req, res) => {
  let date, start_time, end_time;

  try {
    if (req.query.shiftId) {
      // ── leave replacement ──
      const sid = +req.query.shiftId;
      const [[shift]] = await db.query(
        `SELECT date, start_time, end_time
           FROM shifts
          WHERE id = ?`,
        [sid]
      );
      if (!shift) return res.status(404).json({ error:'Shift not found' });
      ({ date, start_time, end_time } = shift);

    } else if (req.query.slotId) {
      // ── special-event slot ──
      const slotId = +req.query.slotId;
      const [[slot]] = await db.query(
        `SELECT
           e.date      AS date,
           s.time_in   AS raw_start,
           s.time_out  AS raw_end
         FROM event_slots s
         JOIN events       e ON e.id = s.event_id
        WHERE s.id = ?`,
        [slotId]
      );
      if (!slot) return res.status(404).json({ error:'Slot not found' });
      date = slot.date;

      // normalize "0900" → "09:00:00"
      const rs = slot.raw_start, re = slot.raw_end;
      start_time = /^\d{4}$/.test(rs) ? `${rs.slice(0,2)}:${rs.slice(2)}:00` : rs;
      end_time   = /^\d{4}$/.test(re) ? `${re.slice(0,2)}:${re.slice(2)}:00` : re;

    } else {
      return res.status(400).json({ error:'shiftId or slotId required' });
    }

    // fetch all active CSO officers
    const CSO_RANKS = ['CDT','CSO','FTO','XO','CS','BS'];
    const [candidates] = await db.query(
      `SELECT id, username, first_name
         FROM users
        WHERE user_rank IN (?)
          AND status = 'active'`,
      [CSO_RANKS]
    );

    const available = [];
    for (let u of candidates) {
      // 1) overlap?
      const [ov] = await db.query(
        `SELECT 1 FROM shifts
           WHERE officer_name = ?
             AND date = ?
             AND NOT (
               end_time <= ? OR start_time >= ?
             )`,
        [u.username, date, start_time, end_time]
      );
      if (ov.length) continue;

      // 2) 16 hrs/day?
      const [dayShifts] = await db.query(
        `SELECT start_time, end_time
           FROM shifts
          WHERE officer_name = ? AND date = ?`,
        [u.username, date]
      );
      const totalHrs = dayShifts.reduce(
        (sum, s) => sum + diffHours(s.start_time, s.end_time),
        0
      ) + diffHours(start_time, end_time);
      if (totalHrs > 16) continue;

      // 3) on approved leave?
      const [lv] = await db.query(
        `SELECT 1 FROM cso_leave_requests
           WHERE user_id = ?
             AND status = 'approved'
             AND start_date <= ?
             AND end_date   >= ?`,
        [u.id, date, date]
      );
      if (lv.length) continue;

      available.push(u);
    }

    return res.json(available);
  } catch (err) {
    console.error('GET /api/cso/mandates/availability error:', err);
    return res.status(500).json({ error:'Server error' });
  }
});

/**
 * POST /api/cso/mandates
 * Body: { officerId, reason?, plus exactly one of shiftId or slotId }
 */
router.post('/', auth, async (req, res) => {
  const { shiftId, slotId, officerId, reason } = req.body;
  if (!officerId || !(shiftId || slotId)) {
    return res.status(400).json({
      error:'Must supply officerId plus shiftId or slotId'
    });
  }

  const mandator = req.user.id;
  const conn     = await db.getConnection();

  try {
    await conn.beginTransaction();

    // 1) Determine date/time/type
    let date, start_time, end_time, shift_type, newShiftId;
    if (shiftId) {
      const [[sh]] = await conn.query(
        `SELECT date, start_time, end_time, shift_type
           FROM shifts WHERE id = ?`,
        [shiftId]
      );
      if (!sh) throw { status:404, error:'Shift not found' };
      ({ date, start_time, end_time, shift_type } = sh);
    } else {
      const sid = +slotId;
      const [[sl]] = await conn.query(
        `SELECT
           s.assignment AS shift_type,
           s.time_in    AS raw_start,
           s.time_out   AS raw_end,
           e.date       AS date
         FROM event_slots s
         JOIN events       e ON e.id = s.event_id
        WHERE s.id = ?`,
        [sid]
      );
      if (!sl) throw { status:404, error:'Slot not found' };
      shift_type = sl.shift_type;
      date       = sl.date;
      start_time = /^\d{4}$/.test(sl.raw_start)
        ? `${sl.raw_start.slice(0,2)}:${sl.raw_start.slice(2)}:00`
        : sl.raw_start;
      end_time   = /^\d{4}$/.test(sl.raw_end)
        ? `${sl.raw_end.slice(0,2)}:${sl.raw_end.slice(2)}:00`
        : sl.raw_end;
    }

    // 2) Lookup username
    const [[urow]] = await conn.query(
      `SELECT username FROM users WHERE id = ?`,
      [officerId]
    );
    if (!urow) throw { status:404, error:'Officer not found' };
    const username = urow.username;

    // 3) Re-run the three conflict checks
    {
      const [ov] = await conn.query(
        `SELECT 1 FROM shifts
           WHERE officer_name=? AND date=?
             AND NOT (end_time <= ? OR start_time >= ?)`,
        [username, date, start_time, end_time]
      );
      if (ov.length) throw { status:409, error:'Overlap' };
    }
    {
      const [ds] = await conn.query(
        `SELECT start_time,end_time FROM shifts
           WHERE officer_name=? AND date=?`,
        [username, date]
      );
      const tot = ds.reduce(
        (sum,s) => sum + diffHours(s.start_time,s.end_time),
        0
      ) + diffHours(start_time,end_time);
      if (tot > 16) throw { status:409, error:'MaxHoursExceeded' };
    }
    {
      const [lv] = await conn.query(
        `SELECT 1 FROM cso_leave_requests
           WHERE user_id=? AND status='approved'
             AND start_date<=? AND end_date>=?`,
        [officerId, date, date]
      );
      if (lv.length) throw { status:409, error:'OnLeave' };
    }

    // 4) Write back
    if (shiftId) {
      // reassign
      await conn.query(
        `UPDATE shifts SET officer_name=?, status='assigned' WHERE id=?`,
        [username, shiftId]
      );
      newShiftId = shiftId;
    } else {
      // claim slot + insert
      const sid = +slotId;
      const [r1] = await conn.query(
        `UPDATE event_slots SET filled_by=?, filled_at=NOW()
           WHERE id=? AND filled_by IS NULL`,
        [officerId, sid]
      );
      if (!r1.affectedRows) throw { status:409, error:'Slot already filled' };

      const [ins] = await conn.query(
        `INSERT INTO shifts
           (slot_id, shift_type, date, start_time, end_time, officer_name, status)
         VALUES (?, ?, ?, ?, ?, ?, 'assigned')`,
        [sid, shift_type, date, start_time, end_time, username]
      );
      newShiftId = ins.insertId;
    }

    // 5) Audit log
    await conn.query(
      `INSERT INTO cso_mandate_assignments
         (shift_id, mandated_by, mandated_officer, reason)
       VALUES (?, ?, ?, ?)`,
      [newShiftId, mandator, officerId, reason||null]
    );

    await conn.commit();
    return res.json({ success:true, shiftId:newShiftId });

  } catch (err) {
    await conn.rollback();
    console.error('POST /api/cso/mandates error:', err);
    return res.status(err.status||500).json({ error:err.error||'Server error' });
  } finally {
    conn.release();
  }
});

module.exports = router;
