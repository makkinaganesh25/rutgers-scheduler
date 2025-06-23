// // File: backend/routes/shifts.js
// const express           = require('express');
// const db                = require('../db');       // promise‐pool
// const authenticateToken = require('../middleware/auth');
// const { updateShiftInSheetDynamic } = require('../sheetsApi');

// const router = express.Router();

// // 1) GET all shifts (unprotected)
// router.get('/', async (req, res) => {
//   try {
//     const [rows] = await db.query('SELECT * FROM shifts');
//     res.json(rows);
//   } catch (err) {
//     console.error('GET /shifts error:', err);
//     res.status(500).send('Server error');
//   }
// });

// // 2) GET only the logged-in officer’s shifts
// router.get('/me', authenticateToken, async (req, res) => {
//   try {
//     const officer = req.user.username;
//     const [rows]  = await db.query(
//       'SELECT * FROM shifts WHERE officer_name = ?',
//       [officer]
//     );
//     res.json(rows);
//   } catch (err) {
//     console.error('GET /shifts/me error:', err);
//     res.status(500).json({ error: err.message });
//   }
// });

// // 3) POST a new shift (testing)
// router.post('/', async (req, res) => {
//   const {
//     shift_type, date, start_time, end_time,
//     role, officer_name,
//     sheet_name, sheet_row, sheet_col
//   } = req.body;

//   try {
//     const sql = `
//       INSERT INTO shifts
//         (shift_type, date, start_time, end_time,
//          role, officer_name, sheet_name,
//          sheet_row, sheet_col, status)
//       VALUES (?,?,?,?,?,?,?,?,?,'assigned')
//     `;
//     const [result] = await db.query(sql, [
//       shift_type, date, start_time, end_time,
//       role, officer_name,
//       sheet_name, sheet_row, sheet_col
//     ]);
//     res.json({ message: 'Shift created', shiftId: result.insertId });
//   } catch (err) {
//     console.error('POST /shifts error:', err);
//     res.status(500).send('Server error');
//   }
// });

// // 4) GET all pending coverage requests
// router.get(
//   '/coverage-requests/pending',
//   authenticateToken,
//   async (req, res) => {
//     try {
//       const sql = `
//         SELECT
//           cr.id            AS request_id,
//           cr.shift_id      AS shift_id,
//           s.shift_type,
//           s.date,
//           s.start_time,
//           s.end_time,
//           s.officer_name   AS original_officer,
//           cr.requester_officer
//         FROM coverage_requests cr
//         JOIN shifts s ON cr.shift_id = s.id
//         WHERE cr.status = 'pending'
//         ORDER BY cr.requested_at ASC, cr.queue_position ASC
//       `;
//       const [rows] = await db.query(sql);
//       res.json(rows);
//     } catch (err) {
//       console.error('GET pending error:', err);
//       res.status(500).json({ error: err.message });
//     }
//   }
// );

// // 5) POST coverage-request
// router.post(
//   '/coverage-request',
//   authenticateToken,
//   async (req, res) => {
//     const { shiftId } = req.body;
//     const requester_officer = req.user.username;

//     try {
//       // 1) Fetch the shift
//       const [[shiftRow]] = await db.query(
//         'SELECT * FROM shifts WHERE id = ?',
//         [shiftId]
//       );
//       if (!shiftRow) {
//         return res.status(404).json({ error: 'Shift not found' });
//       }
//       if (shiftRow.officer_name !== requester_officer) {
//         return res.status(403).json({
//           error: 'Only the assigned officer may request coverage for this shift'
//         });
//       }

//       // 2) Count existing pending requests
//       const [[countResult]] = await db.query(
//         'SELECT COUNT(*) AS cnt FROM coverage_requests WHERE shift_id = ? AND status = "pending"',
//         [shiftId]
//       );
//       const queuePosition = countResult.cnt + 1;

//       // 3) Insert into coverage_requests
//       const insertSql = `
//         INSERT INTO coverage_requests
//           (shift_id, requester_officer, queue_position,
//            shift_type, shift_date, shift_start, shift_end)
//         VALUES (?, ?, ?, ?, ?, ?, ?)
//       `;
//       const [insertResult] = await db.query(insertSql, [
//         shiftId,
//         requester_officer,
//         queuePosition,
//         shiftRow.shift_type,
//         shiftRow.date,
//         shiftRow.start_time,
//         shiftRow.end_time
//       ]);

//       // 4) Update shift’s status to "requested"
//       await db.query(
//         'UPDATE shifts SET status = ? WHERE id = ?',
//         ['requested', shiftId]
//       );

//       console.log(`[coverage-request] shift ${shiftId} marked requested`);
//       res.json({
//         message: 'Coverage request submitted',
//         requestId: insertResult.insertId,
//         queuePosition
//       });

//     } catch (err) {
//       console.error('POST /coverage-request error:', err);
//       res.status(500).json({ error: 'Server error' });
//     }
//   }
// );

// // 6) POST coverage-accept
// // router.post(
// //   '/coverage-accept',
// //   authenticateToken,
// //   async (req, res) => {
// //     const { shiftId } = req.body;
// //     const acceptingOfficer = req.user.username;

// //     try {
// //       // 1) Get the earliest pending request
// //       const [topRows] = await db.query(
// //         `
// //         SELECT * FROM coverage_requests
// //         WHERE shift_id = ? AND status = 'pending'
// //         ORDER BY requested_at ASC, queue_position ASC
// //         LIMIT 1
// //         `,
// //         [shiftId]
// //       );
// //       if (!topRows.length) {
// //         return res.status(409).json({ error: 'No pending requests' });
// //       }
// //       const topReq = topRows[0];

// //       // 2) Conflict check
// //       const [conflicts] = await db.query(
// //         `
// //         SELECT
// //           id,
// //           shift_type,
// //           date       AS shift_date,
// //           start_time AS shift_start,
// //           end_time   AS shift_end
// //         FROM shifts
// //         WHERE officer_name = ?
// //           AND date = (SELECT date FROM shifts WHERE id = ?)
// //           AND NOT (
// //             end_time <= (SELECT start_time FROM shifts WHERE id = ?)
// //             OR start_time >= (SELECT end_time   FROM shifts WHERE id = ?)
// //           )
// //         `,
// //         [acceptingOfficer, shiftId, shiftId, shiftId]
// //       );
// //       if (conflicts.length) {
// //         return res
// //           .status(409)
// //           .json({ error: 'Overlapping shift', conflict: conflicts[0] });
// //       }

// //       // 3) Assign the shift
// //       const [uRes] = await db.query(
// //         `
// //         UPDATE shifts
// //         SET officer_name = ?, status = 'assigned'
// //         WHERE id = ? AND status = 'requested'
// //         `,
// //         [acceptingOfficer, shiftId]
// //       );
// //       if (!uRes.affectedRows) {
// //         return res.status(409).json({ error: 'Shift no longer available' });
// //       }

// //       // 4) Mark the coverage request accepted
// //       await db.query(
// //         `UPDATE coverage_requests
// //          SET status = "accepted", accepting_officer = ?
// //          WHERE id = ?`,
// //         [acceptingOfficer, topReq.id]
// //       );

// //       // 5) Fetch sheet info for dynamic update
// //       const [[sRow]] = await db.query(
// //         'SELECT date, start_time, sheet_name FROM shifts WHERE id = ?',
// //         [shiftId]
// //       );

// //       // 6) Push update to Google Sheets
// //       await updateShiftInSheetDynamic(
// //         sRow.sheet_name,
// //         sRow.date,
// //         sRow.start_time,
// //         acceptingOfficer
// //       );

// //       res.json({ message: 'Coverage accepted + sheet updated' });

// //     } catch (err) {
// //       console.error('POST /coverage-accept error:', err);
// //       res.status(500).json({ error: err.message });
// //     }
// //   }
// // );
// router.post(
//   '/coverage-accept',
//   authenticateToken,
//   async (req, res) => {
//     const { shiftId }        = req.body;
//     const acceptingOfficer   = req.user.username;
//     const acceptingOfficerId = req.user.id;
//     const conn = await db.getConnection();

//     try {
//       await conn.beginTransaction();

//       // 1) Check for overlapping assigned shifts FIRST
//       const [conflicts] = await conn.query(
//         `
//         SELECT
//           id,
//           shift_type,
//           date       AS shift_date,
//           start_time AS shift_start,
//           end_time   AS shift_end
//         FROM shifts
//         WHERE officer_name = ?
//           AND date = (SELECT date FROM shifts WHERE id = ?)
//           AND NOT (
//             end_time <= (SELECT start_time FROM shifts WHERE id = ?)
//             OR start_time >= (SELECT end_time   FROM shifts WHERE id = ?)
//           )
//         `,
//         [acceptingOfficer, shiftId, shiftId, shiftId]
//       );
//       if (conflicts.length) {
//         await conn.rollback();
//         return res
//           .status(409)
//           .json({ error: 'Overlapping shift', conflict: conflicts[0] });
//       }

//       // 2) Pull the earliest pending request for this shift
//       const [reqRows] = await conn.query(
//         `
//         SELECT id
//         FROM coverage_requests
//         WHERE shift_id = ? AND status = 'pending'
//         ORDER BY requested_at ASC, queue_position ASC
//         LIMIT 1
//         `,
//         [shiftId]
//       );
//       if (!reqRows.length) {
//         await conn.rollback();
//         return res.status(409).json({ error: 'No pending request' });
//       }
//       const requestId = reqRows[0].id;

//       // 3) Assign the shift
//       const [uRes] = await conn.query(
//         `
//         UPDATE shifts
//            SET officer_name = ?, status = 'assigned'
//          WHERE id = ? AND status = 'requested'
//         `,
//         [acceptingOfficer, shiftId]
//       );
//       if (!uRes.affectedRows) {
//         await conn.rollback();
//         return res.status(409).json({ error: 'Shift not available' });
//       }

//       // 4) Mark the coverage request accepted
//       await conn.query(
//         `
//         UPDATE coverage_requests
//            SET status = 'accepted', accepting_officer = ?
//          WHERE id = ?
//         `,
//         [acceptingOfficer, requestId]
//       );

//       // 5) Sync the event_slots.filled_by
//       await conn.query(
//         `
//         UPDATE event_slots AS es
//         JOIN shifts          AS s ON s.slot_id = es.id
//            SET es.filled_by = ?
//          WHERE s.id = ?
//         `,
//         [acceptingOfficerId, shiftId]
//       );

//       // 6) (optional) update Google Sheets
//       const [[sheetRow]] = await conn.query(
//         `SELECT sheet_name, date, start_time FROM shifts WHERE id = ?`,
//         [shiftId]
//       );
//       if (sheetRow.sheet_name) {
//         await updateShiftInSheetDynamic(
//           sheetRow.sheet_name,
//           sheetRow.date,
//           sheetRow.start_time,
//           acceptingOfficer
//         );
//       }

//       await conn.commit();
//       res.json({ message: 'Coverage accepted' });
//     } catch (err) {
//       await conn.rollback();
//       console.error('POST /shifts/coverage-accept error', err);
//       res.status(500).json({ error: err.message });
//     } finally {
//       conn.release();
//     }
//   }
// );

// module.exports = router;

// File: backend/routes/shifts.js

const express = require('express');
const db = require('../db');               // promise‐pool
const authenticateToken = require('../middleware/auth');
const { updateShiftInSheetDynamic } = require('../sheetsApi');

const router = express.Router();

/* 1) GET all shifts (unprotected) */
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM shifts');
    res.json(rows);
  } catch (err) {
    console.error('GET /shifts error:', err);
    res.status(500).send('Server error');
  }
});

/* 2) GET only the logged-in officer’s shifts */
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const officer = req.user.username;
    const [rows] = await db.query(
      'SELECT * FROM shifts WHERE officer_name = ?',
      [officer]
    );
    res.json(rows);
  } catch (err) {
    console.error('GET /shifts/me error:', err);
    res.status(500).json({ error: err.message });
  }
});

/* 3) POST a new shift (testing) */
router.post('/', async (req, res) => {
  const {
    shift_type, date, start_time, end_time,
    role, officer_name,
    sheet_name, sheet_row, sheet_col
  } = req.body;

  try {
    const sql = `
      INSERT INTO shifts
        (shift_type, date, start_time, end_time,
         role, officer_name, sheet_name,
         sheet_row, sheet_col, status)
      VALUES (?,?,?,?,?,?,?,?,?,'assigned')
    `;
    const [result] = await db.query(sql, [
      shift_type, date, start_time, end_time,
      role, officer_name,
      sheet_name, sheet_row, sheet_col
    ]);
    res.json({ message: 'Shift created', shiftId: result.insertId });
  } catch (err) {
    console.error('POST /shifts error:', err);
    res.status(500).send('Server error');
  }
});

/* 4) GET pending coverage requests */
router.get(
  '/coverage-requests/pending',
  authenticateToken,
  async (req, res) => {
    try {
      const sql = `
        SELECT
          cr.id           AS request_id,
          cr.shift_id     AS shift_id,
          s.shift_type,
          s.date,
          s.start_time,
          s.end_time,
          s.officer_name  AS original_officer,
          cr.requester_officer
        FROM coverage_requests cr
        JOIN shifts s ON cr.shift_id = s.id
        WHERE cr.status = 'pending'
        ORDER BY cr.requested_at ASC, cr.queue_position ASC
      `;
      const [rows] = await db.query(sql);
      res.json(rows);
    } catch (err) {
      console.error('GET /coverage-requests/pending error:', err);
      res.status(500).json({ error: err.message });
    }
  }
);

/* 5) POST coverage-request */
router.post(
  '/coverage-request',
  authenticateToken,
  async (req, res) => {
    const { shiftId } = req.body;
    const requester_officer = req.user.username;

    try {
      const [[shiftRow]] = await db.query(
        'SELECT * FROM shifts WHERE id = ?',
        [shiftId]
      );
      if (!shiftRow) {
        return res.status(404).json({ error: 'Shift not found' });
      }
      if (shiftRow.officer_name !== requester_officer) {
        return res.status(403).json({ error: 'Not your shift' });
      }

      const [[countResult]] = await db.query(
        'SELECT COUNT(*) AS cnt FROM coverage_requests WHERE shift_id = ? AND status = "pending"',
        [shiftId]
      );
      const queuePosition = countResult.cnt + 1;

      const insertSql = `
        INSERT INTO coverage_requests
          (shift_id, requester_officer, queue_position,
           shift_type, shift_date, shift_start, shift_end)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      const [insertResult] = await db.query(insertSql, [
        shiftId,
        requester_officer,
        queuePosition,
        shiftRow.shift_type,
        shiftRow.date,
        shiftRow.start_time,
        shiftRow.end_time
      ]);

      await db.query(
        'UPDATE shifts SET status = ? WHERE id = ?',
        ['requested', shiftId]
      );

      res.json({
        message: 'Coverage requested',
        requestId: insertResult.insertId,
        queuePosition
      });
    } catch (err) {
      console.error('POST /coverage-request error:', err);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

/* 6) POST coverage-accept */
router.post(
  '/coverage-accept',
  authenticateToken,
  async (req, res) => {
    const { shiftId } = req.body;
    const acceptingOfficer = req.user.username;
    const acceptingOfficerId = req.user.id;
    const conn = await db.getConnection();

    try {
      await conn.beginTransaction();

      // Conflict check (same-date)
      const [conflicts] = await conn.query(
        `
        SELECT id, shift_type, date AS shift_date,
               start_time AS shift_start, end_time AS shift_end
        FROM shifts
        WHERE officer_name = ?
          AND date = (SELECT date FROM shifts WHERE id = ?)
          AND NOT (
            end_time <= (SELECT start_time FROM shifts WHERE id = ?)
            OR start_time >= (SELECT end_time   FROM shifts WHERE id = ?)
          )
        `,
        [acceptingOfficer, shiftId, shiftId, shiftId]
      );
      if (conflicts.length) {
        await conn.rollback();
        return res
          .status(409)
          .json({ error: 'Overlapping shift', conflict: conflicts[0] });
      }

      const [reqRows] = await conn.query(
        `
        SELECT id
        FROM coverage_requests
        WHERE shift_id = ? AND status = 'pending'
        ORDER BY requested_at ASC, queue_position ASC
        LIMIT 1
        `,
        [shiftId]
      );
      if (!reqRows.length) {
        await conn.rollback();
        return res.status(409).json({ error: 'No pending request' });
      }
      const requestId = reqRows[0].id;

      const [uRes] = await conn.query(
        `
        UPDATE shifts
           SET officer_name = ?, status = 'assigned'
         WHERE id = ? AND status = 'requested'
        `,
        [acceptingOfficer, shiftId]
      );
      if (!uRes.affectedRows) {
        await conn.rollback();
        return res.status(409).json({ error: 'Shift not available' });
      }

      await conn.query(
        `
        UPDATE coverage_requests
           SET status = 'accepted', accepting_officer = ?
         WHERE id = ?
        `,
        [acceptingOfficer, requestId]
      );

      await conn.query(
        `
        UPDATE event_slots AS es
        JOIN shifts          AS s ON s.slot_id = es.id
           SET es.filled_by = ?
         WHERE s.id = ?
        `,
        [acceptingOfficerId, shiftId]
      );

      const [[sheetRow]] = await conn.query(
        `SELECT sheet_name, date, start_time FROM shifts WHERE id = ?`,
        [shiftId]
      );
      if (sheetRow.sheet_name) {
        await updateShiftInSheetDynamic(
          sheetRow.sheet_name,
          sheetRow.date,
          sheetRow.start_time,
          acceptingOfficer
        );
      }

      await conn.commit();
      res.json({ message: 'Coverage accepted' });
    } catch (err) {
      await conn.rollback();
      console.error('POST /coverage-accept error:', err);
      res.status(500).json({ error: err.message });
    } finally {
      conn.release();
    }
  }
);

/* 7) GET swap candidates (all other shifts grouped by officer) */
router.get(
  '/swaps/:shiftId/candidates',
  authenticateToken,
  async (req, res) => {
    const shiftId = Number(req.params.shiftId);
    const requester = req.user.username;

    try {
      const [rows] = await db.query(
        `
        SELECT officer_name,
               id AS shift_id,
               shift_type,
               date, start_time, end_time
        FROM shifts
        WHERE id != ? AND officer_name <> ?
        ORDER BY officer_name, date, start_time
        `,
        [shiftId, requester]
      );

      const byOfficer = rows.reduce((acc, r) => {
        (acc[r.officer_name] ||= []).push(r);
        return acc;
      }, {});

      res.json(byOfficer);
    } catch (err) {
      console.error('GET /swaps/:shiftId/candidates error:', err);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

/* 8) POST a new swap request */
router.post(
  '/swap-request',
  authenticateToken,
  async (req, res) => {
    console.log('🛠 POST /swap-request body:', req.body);
    const { requester_shift_id, target_shift_id } = req.body;
    const requester_officer = req.user.username;

    if (
      typeof requester_shift_id !== 'number' ||
      typeof target_shift_id    !== 'number'
    ) {
      return res.status(400).json({
        error: 'Both IDs must be numbers',
        received: { requester_shift_id, target_shift_id }
      });
    }

    try {
      const [[reqShift]] = await db.query(
        'SELECT * FROM shifts WHERE id = ?',
        [requester_shift_id]
      );
      const [[tgtShift]] = await db.query(
        'SELECT * FROM shifts WHERE id = ?',
        [target_shift_id]
      );
      if (!reqShift || !tgtShift) {
        return res.status(404).json({ error: 'Shift not found' });
      }
      if (reqShift.officer_name !== requester_officer) {
        return res.status(403).json({ error: 'Not your shift' });
      }

      const [result] = await db.query(
        `INSERT INTO swap_requests
           (requester_officer, requester_shift_id, target_officer, target_shift_id)
         VALUES (?,?,?,?)`,
        [
          requester_officer,
          requester_shift_id,
          tgtShift.officer_name,
          target_shift_id
        ]
      );

      res.json({
        message: 'Swap request submitted',
        requestId: result.insertId
      });
    } catch (err) {
      console.error('POST /swap-request error:', err);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

/* 9) GET pending swap requests */
router.get(
  '/swap-requests/pending',
  authenticateToken,
  async (req, res) => {
    const target_officer = req.user.username;
    try {
      const [rows] = await db.query(
        `SELECT id AS request_id,
                requester_officer,
                requester_shift_id,
                target_shift_id,
                requested_at
         FROM swap_requests
         WHERE target_officer = ? AND status = 'pending'
         ORDER BY requested_at ASC`,
        [target_officer]
      );

      const enriched = await Promise.all(
        rows.map(async r => {
          const [[reqS]] = await db.query(
            'SELECT shift_type, date, start_time, end_time FROM shifts WHERE id = ?',
            [r.requester_shift_id]
          );
          const [[tgtS]] = await db.query(
            'SELECT shift_type, date, start_time, end_time FROM shifts WHERE id = ?',
            [r.target_shift_id]
          );
          return {
            request_id: r.request_id,
            requester_officer: r.requester_officer,
            requester_shift: reqS,
            target_shift: tgtS,
            requested_at: r.requested_at
          };
        })
      );

      res.json(enriched);
    } catch (err) {
      console.error('GET /swap-requests/pending error:', err);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

/* 10) POST respond to a swap request (with conflict check) */
router.post(
  '/swap-requests/:id/respond',
  authenticateToken,
  async (req, res) => {
    const { action } = req.body; // "accept" or "decline"
    const target_officer = req.user.username;
    const requestId = Number(req.params.id);
    const conn = await db.getConnection();

    try {
      await conn.beginTransaction();

      const [[swapReq]] = await conn.query(
        'SELECT * FROM swap_requests WHERE id = ? FOR UPDATE',
        [requestId]
      );
      if (!swapReq) {
        await conn.rollback();
        return res.status(404).json({ error: 'Swap request not found' });
      }
      if (swapReq.target_officer !== target_officer) {
        await conn.rollback();
        return res.status(403).json({ error: 'Not authorized' });
      }
      if (swapReq.status !== 'pending') {
        await conn.rollback();
        return res.status(409).json({ error: 'Already responded' });
      }

      if (action === 'decline') {
        await conn.query(
          `UPDATE swap_requests
             SET status = 'declined', responded_at = NOW()
           WHERE id = ?`,
          [requestId]
        );
        await conn.commit();
        return res.json({ message: 'Swap declined' });
      }

      // --- conflict check before accept ---
      const [[incoming]] = await conn.query(
        `SELECT date, start_time, end_time FROM shifts WHERE id = ?`,
        [swapReq.requester_shift_id]
      );
      const [conflicts] = await conn.query(
        `
        SELECT id, shift_type, date, start_time, end_time
        FROM shifts
        WHERE officer_name = ?
          AND date = ?
          AND NOT (
            end_time <= ?
            OR start_time >= ?
          )
        `,
        [
          target_officer,
          incoming.date,
          incoming.start_time,
          incoming.end_time
        ]
      );
      if (conflicts.length) {
        await conn.rollback();
        return res
          .status(409)
          .json({ error: 'Overlapping shift', conflict: conflicts[0] });
      }

      // perform the swap
      await conn.query(
        `UPDATE shifts SET officer_name = ? WHERE id = ?`,
        [swapReq.requester_officer, swapReq.target_shift_id]
      );
      await conn.query(
        `UPDATE shifts SET officer_name = ? WHERE id = ?`,
        [swapReq.target_officer, swapReq.requester_shift_id]
      );
      await conn.query(
        `UPDATE swap_requests
           SET status = 'accepted', responded_at = NOW()
         WHERE id = ?`,
        [requestId]
      );

      await conn.commit();
      res.json({ message: 'Swap completed successfully' });
    } catch (err) {
      await conn.rollback();
      console.error('POST /swap-requests/:id/respond error:', err);
      res.status(500).json({ error: 'Server error' });
    } finally {
      conn.release();
    }
  }
);

module.exports = router;
