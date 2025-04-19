// // backend/routes/shifts.js
// const express = require('express');
// const db      = require('../db');
// const {
//   updateShiftInSheetDynamic
// } = require('../sheetsApi');
// const router  = express.Router();

// // ==============================================
// // GET all shifts
// // ==============================================
// router.get('/', (req, res) => {
//   const query = 'SELECT * FROM shifts';
//   db.query(query, (err, results) => {
//     if (err) {
//       console.error('Error fetching shifts:', err);
//       return res.status(500).send('Server error');
//     }
//     res.json(results);
//   });
// });

// // ==============================================
// // POST a new shift (for testing purposes)
// // ==============================================
// router.post('/', (req, res) => {
//   const {
//     shift_type,
//     date,
//     start_time,
//     end_time,
//     role,
//     officer_name,
//     sheet_name,
//     sheet_row,
//     sheet_col
//   } = req.body;

//   const query = `
//     INSERT INTO shifts
//       (shift_type, date, start_time, end_time,
//        role, officer_name, sheet_name,
//        sheet_row, sheet_col, status)
//     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'open')
//   `;
//   db.query(
//     query,
//     [
//       shift_type,
//       date,
//       start_time,
//       end_time,
//       role,
//       officer_name,
//       sheet_name,
//       sheet_row,
//       sheet_col
//     ],
//     (err, result) => {
//       if (err) {
//         console.error('Error creating shift:', err);
//         return res.status(500).send('Server error');
//       }
//       res.json({ message: 'Shift created successfully', shiftId: result.insertId });
//     }
//   );
// });

// // ==============================================
// // POST a coverage request with queue handling
// // ==============================================
// router.post('/coverage-request', (req, res) => {
//   const { shiftId, requester_officer } = req.body;

//   // 1. Fetch the shift to ensure the requester is the assigned officer.
//   db.query('SELECT * FROM shifts WHERE id = ?', [shiftId], (shiftErr, shiftResults) => {
//     if (shiftErr) {
//       console.error('Error fetching shift:', shiftErr);
//       return res.status(500).json({ error: 'Server error while fetching shift' });
//     }
//     if (!shiftResults.length) {
//       return res.status(404).json({ error: 'Shift not found' });
//     }

//     const shiftRow = shiftResults[0];
//     if (!shiftRow.officer_name || shiftRow.officer_name !== requester_officer) {
//       return res.status(403).json({
//         error: 'Only the assigned officer may request coverage for this shift'
//       });
//     }

//     // 2. Count pending coverage requests for this shift
//     db.query(
//       'SELECT COUNT(*) AS cnt FROM coverage_requests WHERE shift_id = ? AND status = "pending"',
//       [shiftId],
//       (countErr, countResult) => {
//         if (countErr) {
//           console.error('Error counting coverage requests:', countErr);
//           return res.status(500).json({ error: 'Server error' });
//         }

//         const queuePosition = countResult[0].cnt + 1;

//         // 3. Insert the coverage request into the queue
//         db.query(
//           `INSERT INTO coverage_requests (shift_id, requester_officer, queue_position)
//            VALUES (?, ?, ?)`,
//           [shiftId, requester_officer, queuePosition],
//           (err, result) => {
//             if (err) {
//               console.error('Error inserting coverage request:', err);
//               return res.status(500).json({ error: 'Server error' });
//             }

//             // Optionally update the shift status to "requested"
//             db.query('UPDATE shifts SET status = ? WHERE id = ?', ['requested', shiftId]);
//             res.json({
//               message: 'Coverage request submitted',
//               requestId: result.insertId,
//               queuePosition,
//               shiftDetails: {
//                 shift_type: shiftRow.shift_type,
//                 date: shiftRow.date,
//                 start_time: shiftRow.start_time,
//                 end_time: shiftRow.end_time,
//                 role: shiftRow.role
//               }
//             });
//           }
//         );
//       }
//     );
//   });
// });

// // POST coverage acceptance (dynamic sheet update)
// router.post('/coverage-accept', (req, res) => {
//   const { shiftId, acceptingOfficer } = req.body;
//   console.log('[coverage-accept] incoming', { shiftId, acceptingOfficer });

//   // 1) get the earliest pending request
//   const topRequestQuery = `
//     SELECT * FROM coverage_requests
//     WHERE shift_id = ? AND status = 'pending'
//     ORDER BY requested_at ASC, queue_position ASC
//     LIMIT 1
//   `;
//   db.query(topRequestQuery, [shiftId], (err, topRows) => {
//     if (err) return res.status(500).json({ error: err.message });
//     if (!topRows.length) return res.status(409).json({ error: 'No pending requests' });
//     const topReq = topRows[0];

//     // 2) conflict check
//     const conflictQuery = `
//       SELECT id FROM shifts
//       WHERE officer_name = ?
//         AND date = (SELECT date FROM shifts WHERE id = ?)
//         AND NOT (
//           end_time <= (SELECT start_time FROM shifts WHERE id = ?)
//           OR start_time >= (SELECT end_time   FROM shifts WHERE id = ?)
//         )
//     `;
//     db.query(conflictQuery,
//       [acceptingOfficer, shiftId, shiftId, shiftId],
//       (cErr, conflicts) => {
//         if (cErr) return res.status(500).json({ error: cErr.message });
//         if (conflicts.length) {
//           return res.status(409).json({ error: 'Overlapping shift', conflict: conflicts[0] });
//         }

//         // 3) assign the shift
//         const assignSql = `
//           UPDATE shifts
//           SET officer_name = ?, status = 'assigned'
//           WHERE id = ? AND status = 'requested'
//         `;
//         db.query(assignSql, [acceptingOfficer, shiftId], (uErr, uRes) => {
//           if (uErr) return res.status(500).json({ error: uErr.message });
//           if (!uRes.affectedRows) {
//             return res.status(409).json({ error: 'Shift no longer available' });
//           }

//           // 4) mark the coverage request accepted
//           db.query(
//             'UPDATE coverage_requests SET status = "accepted" WHERE id = ?',
//             [topReq.id],
//             cvErr => {
//               if (cvErr) return res.status(500).json({ error: cvErr.message });

//               // 5) fetch the shift’s date, start_time & sheet tab
//               db.query(
//                 'SELECT date, start_time, sheet_name FROM shifts WHERE id = ?',
//                 [shiftId],
//                 async (sErr, sRows) => {
//                   if (sErr) return res.status(500).json({ error: sErr.message });
//                   const { date, start_time, sheet_name } = sRows[0];

//                   // 6) dynamic Sheets update
//                   try {
//                     await updateShiftInSheetDynamic(
//                       sheet_name,
//                       date,
//                       start_time,
//                       acceptingOfficer
//                     );
//                     return res.json({ message: 'Coverage accepted + sheet updated' });
//                   } catch (sheetErr) {
//                     console.error('Sheets API error:', sheetErr);
//                     return res.status(500).json({ error: sheetErr.message });
//                   }
//                 }
//               );
//             }
//           );
//         });
//       }
//     );
//   });
// });

// module.exports = router;


// backend/routes/shifts.js
const express = require('express');
const db      = require('../db');
const authenticateToken = require('../middleware/auth');
const {
  updateShiftInSheetDynamic
} = require('../sheetsApi');

const router = express.Router();

// Unprotected admin route: GET all shifts
router.get('/', (req, res) => {
  db.query('SELECT * FROM shifts', (err, rows) => {
    if (err) return res.status(500).send('Server error');
    res.json(rows);
  });
});

// Protected: GET only the logged‑in officer’s shifts
router.get('/me', authenticateToken, (req, res) => {
  const officer = req.user.username;
  db.query(
    'SELECT * FROM shifts WHERE officer_name = ?',
    [officer],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

// POST a new shift (testing)
router.post('/', (req, res) => {
  const {
    shift_type,
    date,
    start_time,
    end_time,
    role,
    officer_name,
    sheet_name,
    sheet_row,
    sheet_col
  } = req.body;

  const sql = `
    INSERT INTO shifts
      (shift_type,date,start_time,end_time,
       role,officer_name,sheet_name,
       sheet_row,sheet_col,status)
    VALUES (?,?,?,?,?,?,?,?,?,'open')
  `;
  db.query(
    sql,
    [
      shift_type,
      date,
      start_time,
      end_time,
      role,
      officer_name,
      sheet_name,
      sheet_row,
      sheet_col
    ],
    (err, result) => {
      if (err) return res.status(500).send('Server error');
      res.json({ message: 'Shift created', shiftId: result.insertId });
    }
  );
});

// POST coverage-request (unchanged)
router.post('/coverage-request', (req, res) => {
  const { shiftId, requester_officer } = req.body;

  // 1. Fetch the shift to ensure the requester is the assigned officer.
  db.query('SELECT * FROM shifts WHERE id = ?', [shiftId], (shiftErr, shiftResults) => {
    if (shiftErr) {
      console.error('Error fetching shift:', shiftErr);
      return res.status(500).json({ error: 'Server error while fetching shift' });
    }
    if (!shiftResults.length) {
      return res.status(404).json({ error: 'Shift not found' });
    }

    const shiftRow = shiftResults[0];
    if (!shiftRow.officer_name || shiftRow.officer_name !== requester_officer) {
      return res.status(403).json({
        error: 'Only the assigned officer may request coverage for this shift'
      });
    }

    // 2. Count pending coverage requests for this shift
    db.query(
      'SELECT COUNT(*) AS cnt FROM coverage_requests WHERE shift_id = ? AND status = "pending"',
      [shiftId],
      (countErr, countResult) => {
        if (countErr) {
          console.error('Error counting coverage requests:', countErr);
          return res.status(500).json({ error: 'Server error' });
        }

        const queuePosition = countResult[0].cnt + 1;

        // 3. Insert the coverage request into the queue
        db.query(
          `INSERT INTO coverage_requests (shift_id, requester_officer, queue_position)
           VALUES (?, ?, ?)`,
          [shiftId, requester_officer, queuePosition],
          (err, result) => {
            if (err) {
              console.error('Error inserting coverage request:', err);
              return res.status(500).json({ error: 'Server error' });
            }

            // Optionally update the shift status to "requested"
            db.query('UPDATE shifts SET status = ? WHERE id = ?', ['requested', shiftId]);
            res.json({
              message: 'Coverage request submitted',
              requestId: result.insertId,
              queuePosition,
              shiftDetails: {
                shift_type: shiftRow.shift_type,
                date: shiftRow.date,
                start_time: shiftRow.start_time,
                end_time: shiftRow.end_time,
                role: shiftRow.role
              }
            });
          }
        );
      }
    );
  });
});

// POST coverage-accept (dynamic sheet update; unchanged)
router.post('/coverage-accept', (req, res) => {
  const { shiftId, acceptingOfficer } = req.body;

  console.log('[coverage-accept] incoming', { shiftId, acceptingOfficer });

  // 1) get the earliest pending request
  const topRequestQuery = `
    SELECT * FROM coverage_requests
    WHERE shift_id = ? AND status = 'pending'
    ORDER BY requested_at ASC, queue_position ASC
    LIMIT 1
  `;
  db.query(topRequestQuery, [shiftId], (err, topRows) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!topRows.length) return res.status(409).json({ error: 'No pending requests' });
    const topReq = topRows[0];

    // 2) conflict check
    const conflictQuery = `
      SELECT id FROM shifts
      WHERE officer_name = ?
        AND date = (SELECT date FROM shifts WHERE id = ?)
        AND NOT (
          end_time <= (SELECT start_time FROM shifts WHERE id = ?)
          OR start_time >= (SELECT end_time   FROM shifts WHERE id = ?)
        )
    `;
    db.query(conflictQuery,
      [acceptingOfficer, shiftId, shiftId, shiftId],
      (cErr, conflicts) => {
        if (cErr) return res.status(500).json({ error: cErr.message });
        if (conflicts.length) {
          return res.status(409).json({ error: 'Overlapping shift', conflict: conflicts[0] });
        }

        // 3) assign the shift
        const assignSql = `
          UPDATE shifts
          SET officer_name = ?, status = 'assigned'
          WHERE id = ? AND status = 'requested'
        `;
        db.query(assignSql, [acceptingOfficer, shiftId], (uErr, uRes) => {
          if (uErr) return res.status(500).json({ error: uErr.message });
          if (!uRes.affectedRows) {
            return res.status(409).json({ error: 'Shift no longer available' });
          }

          // 4) mark the coverage request accepted
          db.query(
            'UPDATE coverage_requests SET status = "accepted" WHERE id = ?',
            [topReq.id],
            cvErr => {
              if (cvErr) return res.status(500).json({ error: cvErr.message });

              // 5) fetch the shift’s date, start_time & sheet tab
              db.query(
                'SELECT date, start_time, sheet_name FROM shifts WHERE id = ?',
                [shiftId],
                async (sErr, sRows) => {
                  if (sErr) return res.status(500).json({ error: sErr.message });
                  const { date, start_time, sheet_name } = sRows[0];

                  // 6) dynamic Sheets update
                  try {
                    await updateShiftInSheetDynamic(
                      sheet_name,
                      date,
                      start_time,
                      acceptingOfficer
                    );
                    return res.json({ message: 'Coverage accepted + sheet updated' });
                  } catch (sheetErr) {
                    console.error('Sheets API error:', sheetErr);
                    return res.status(500).json({ error: sheetErr.message });
                  }
                }
              );
            }
          );
        });
      }
    );
  });
});

module.exports = router;
