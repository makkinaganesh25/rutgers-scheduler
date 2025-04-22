// routes/shifts.js
const express = require('express');
const db = require('../db');
const authenticateToken = require('../middleware/auth');
const { updateShiftInSheetDynamic } = require('../sheetsApi');

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
    shift_type, date, start_time, end_time,
    role, officer_name,
    sheet_name, sheet_row, sheet_col
  } = req.body;

  const sql = `
    INSERT INTO shifts
      (shift_type, date, start_time, end_time,
       role, officer_name, sheet_name,
       sheet_row, sheet_col, status)
    VALUES (?,?,?,?,?,?,?,?,?,'assigned')
  `;
  db.query(
    sql,
    [ shift_type, date, start_time, end_time,
      role, officer_name,
      sheet_name, sheet_row, sheet_col
    ],
    (err, result) => {
      if (err) return res.status(500).send('Server error');
      res.json({ message: 'Shift created', shiftId: result.insertId });
    }
  );
});

// GET all pending coverage requests
router.get(
  '/coverage-requests/pending',
  authenticateToken,
  (req, res) => {
    const sql = `
      SELECT
        cr.id            AS request_id,
        cr.shift_id      AS shift_id,
        s.shift_type,
        s.date,
        s.start_time,
        s.end_time,
        s.officer_name   AS original_officer,
        cr.requester_officer
      FROM coverage_requests cr
      JOIN shifts s ON cr.shift_id = s.id
      WHERE cr.status = 'pending'
      ORDER BY cr.requested_at ASC, cr.queue_position ASC
    `;
    db.query(sql, (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    });
  }
);

// POST coverage‑request (officer asks someone else to cover their own shift)
router.post(
  '/coverage-request',
  authenticateToken,
  (req, res) => {
    const { shiftId } = req.body;
    const requester_officer = req.user.username;
    console.log('[coverage-request] incoming', { shiftId, requester_officer });

    // 1) Fetch the shift
    db.query(
      'SELECT * FROM shifts WHERE id = ?',
      [shiftId],
      (shiftErr, shiftResults) => {
        if (shiftErr) {
          console.error('Error fetching shift:', shiftErr);
          return res.status(500).json({ error: 'Server error while fetching shift' });
        }
        if (!shiftResults.length) {
          return res.status(404).json({ error: 'Shift not found' });
        }

        const shiftRow = shiftResults[0];
        if (shiftRow.officer_name !== requester_officer) {
          return res.status(403).json({
            error: 'Only the assigned officer may request coverage for this shift'
          });
        }

        // 2) Count existing pending requests
        db.query(
          'SELECT COUNT(*) AS cnt FROM coverage_requests WHERE shift_id = ? AND status = "pending"',
          [shiftId],
          (countErr, countResult) => {
            if (countErr) {
              console.error('Error counting coverage requests:', countErr);
              return res.status(500).json({ error: 'Server error' });
            }

            const queuePosition = countResult[0].cnt + 1;

            // 3) Insert into coverage_requests, now including all required columns
            const insertSql = `
              INSERT INTO coverage_requests
                (shift_id, requester_officer, queue_position,
                 shift_type, shift_date, shift_start, shift_end)
              VALUES (?, ?, ?, ?, ?, ?, ?)
            `;
            db.query(
              insertSql,
              [
                shiftId,
                requester_officer,
                queuePosition,
                shiftRow.shift_type,
                shiftRow.date,
                shiftRow.start_time,
                shiftRow.end_time
              ],
              (insertErr, insertResult) => {
                if (insertErr) {
                  console.error('Error inserting coverage request:', insertErr);
                  return res.status(500).json({ error: 'Server error' });
                }

                // 4) Update shift’s status to "requested"
                db.query(
                  'UPDATE shifts SET status = ? WHERE id = ?',
                  ['requested', shiftId],
                  (updateErr) => {
                    if (updateErr) {
                      console.error('Error updating shift status:', updateErr);
                      return res.status(500).json({ error: 'Server error' });
                    }

                    console.log(`[coverage-request] shift ${shiftId} marked requested`);
                    return res.json({
                      message: 'Coverage request submitted',
                      requestId: insertResult.insertId,
                      queuePosition
                    });
                  }
                );
              }
            );
          }
        );
      }
    );
  }
);

// POST coverage‑accept (any officer accepts the earliest pending request)
router.post(
  '/coverage-accept',
  authenticateToken,
  (req, res) => {
    const { shiftId } = req.body;
    const acceptingOfficer = req.user.username;

    // 1) Get the earliest pending request
    const topRequestQuery = `
      SELECT * FROM coverage_requests
      WHERE shift_id = ? AND status = 'pending'
      ORDER BY requested_at ASC, queue_position ASC
      LIMIT 1
    `;
    db.query(topRequestQuery, [shiftId], (err, topRows) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!topRows.length) {
        return res.status(409).json({ error: 'No pending requests' });
      }
      const topReq = topRows[0];

      // 2) Conflict check (returns the full blocking shift)
      const conflictQuery = `
        SELECT
          id,
          shift_type,
          date       AS shift_date,
          start_time AS shift_start,
          end_time   AS shift_end
        FROM shifts
        WHERE officer_name = ?
          AND date = (SELECT date FROM shifts WHERE id = ?)
          AND NOT (
            end_time <= (SELECT start_time FROM shifts WHERE id = ?)
            OR start_time >= (SELECT end_time   FROM shifts WHERE id = ?)
          )
      `;
      db.query(
        conflictQuery,
        [acceptingOfficer, shiftId, shiftId, shiftId],
        (cErr, conflicts) => {
          if (cErr) return res.status(500).json({ error: cErr.message });
          if (conflicts.length) {
            // return conflict details
            return res
              .status(409)
              .json({ error: 'Overlapping shift', conflict: conflicts[0] });
          }

          // 3) Assign the shift
          const assignSql = `
            UPDATE shifts
            SET officer_name = ?, status = 'assigned'
            WHERE id = ? AND status = 'requested'
          `;
          db.query(assignSql, [acceptingOfficer, shiftId], (uErr, uRes) => {
            if (uErr) return res.status(500).json({ error: uErr.message });
            if (!uRes.affectedRows) {
              return res
                .status(409)
                .json({ error: 'Shift no longer available' });
            }

            // 4) Mark the coverage request accepted (and record who accepted)
            db.query(
              'UPDATE coverage_requests SET status = "accepted", accepting_officer = ? WHERE id = ?',
              [acceptingOfficer, topReq.id],
              cvErr => {
                if (cvErr) return res.status(500).json({ error: cvErr.message });

                // 5) Fetch sheet info for dynamic update
                db.query(
                  'SELECT date, start_time, sheet_name FROM shifts WHERE id = ?',
                  [shiftId],
                  async (sErr, sRows) => {
                    if (sErr) return res.status(500).json({ error: sErr.message });

                    const { date, start_time, sheet_name } = sRows[0];

                    // 6) Push update to Google Sheets
                    try {
                      await updateShiftInSheetDynamic(
                        sheet_name,
                        date,
                        start_time,
                        acceptingOfficer
                      );
                      return res.json({
                        message: 'Coverage accepted + sheet updated'
                      });
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
  }
);

module.exports = router;
