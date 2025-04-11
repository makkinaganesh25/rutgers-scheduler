// // routes/shifts.js
// const express = require('express');
// const db = require('../db');
// const { updateShiftInSheet } = require('../sheetsApi'); // Google Sheets helper
// const router = express.Router();

// // GET all shifts
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

// // POST a new shift (for testing purposes)
// router.post('/', (req, res) => {
//   const { shift_type, date, start_time, end_time, role, officer_name, sheet_name, sheet_row, sheet_col } = req.body;
//   const query = `
//     INSERT INTO shifts (shift_type, date, start_time, end_time, role, officer_name, sheet_name, sheet_row, sheet_col, status)
//     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'open')
//   `;
//   db.query(query, [shift_type, date, start_time, end_time, role, officer_name, sheet_name, sheet_row, sheet_col], (err, result) => {
//     if (err) {
//       console.error('Error creating shift:', err);
//       return res.status(500).send('Server error');
//     }
//     res.json({ message: 'Shift created successfully', shiftId: result.insertId });
//   });
// });

// // POST a coverage request
// router.post('/coverage-request', (req, res) => {
//   const { shiftId, requester_officer } = req.body;
//   const insertQuery = `
//     INSERT INTO coverage_requests (shift_id, requester_officer)
//     VALUES (?, ?)
//   `;
//   db.query(insertQuery, [shiftId, requester_officer], (err, result) => {
//     if (err) {
//       console.error('Error inserting coverage request:', err);
//       return res.status(500).json({ error: 'Server error' });
//     }
//     // Optionally update the shift status to "requested"
//     db.query('UPDATE shifts SET status = ? WHERE id = ?', ['requested', shiftId]);
//     res.json({ message: 'Coverage request submitted', requestId: result.insertId });
//   });
// });

// // POST coverage acceptance endpoint with detailed conflict feedback
// router.post('/coverage-accept', (req, res) => {
//   const { shiftId, acceptingOfficer } = req.body;

//   // 1. Conflict check: return details if a conflict exists.
//   const conflictQuery = `
//     SELECT id, date, start_time, end_time, role, officer_name
//     FROM shifts 
//     WHERE officer_name = ? 
//       AND date = (SELECT date FROM shifts WHERE id = ?)
//       AND NOT (
//             end_time <= (SELECT start_time FROM shifts WHERE id = ?)
//             OR start_time >= (SELECT end_time FROM shifts WHERE id = ?)
//           )
//   `;
//   db.query(conflictQuery, [acceptingOfficer, shiftId, shiftId, shiftId], (conflictErr, conflictResult) => {
//     if (conflictErr) {
//       return res.status(500).json({ error: conflictErr.message });
//     }
//     if (conflictResult.length > 0) {
//       // Return conflict details for user feedback.
//       return res.status(409).json({
//         error: "Overlapping shift exists for this officer.",
//         conflict: conflictResult[0]
//       });
//     }
    
//     // 2. Update the shift: assign the officer and mark as 'assigned'
//     const updateShiftQuery = `
//       UPDATE shifts SET officer_name = ?, status = 'assigned'
//       WHERE id = ? AND status = 'requested'
//     `;
//     db.query(updateShiftQuery, [acceptingOfficer, shiftId], (updateErr, updateResult) => {
//       if (updateErr) return res.status(500).json({ error: updateErr.message });
//       if (updateResult.affectedRows === 0) {
//         return res.status(409).json({ error: 'Shift is no longer available for coverage' });
//       }
      
//       // 3. Update the coverage request to 'accepted'
//       db.query('UPDATE coverage_requests SET status = ? WHERE shift_id = ?', ['accepted', shiftId], (covErr, covResult) => {
//         if (covErr) return res.status(500).json({ error: covErr.message });
        
//         // 4. Retrieve sheet mapping for this shift
//         db.query('SELECT sheet_name, sheet_row, sheet_col FROM shifts WHERE id = ?', [shiftId], async (selErr, selResult) => {
//           if (selErr) return res.status(500).json({ error: selErr.message });
//           const { sheet_name, sheet_row, sheet_col } = selResult[0];
          
//           // 5. Update the corresponding cell in the Google Sheet
//           try {
//             await updateShiftInSheet(sheet_name, sheet_row, sheet_col, acceptingOfficer);
//             res.json({ message: 'Coverage accepted and sheet updated' });
//           } catch (sheetErr) {
//             res.status(500).json({ error: sheetErr.message });
//           }
//         });
//       });
//     });
//   });
// });

// module.exports = router;

// backend/routes/shifts.js
const express = require('express');
const db = require('../db');
const { updateShiftInSheet } = require('../sheetsApi'); // Google Sheets helper
const router = express.Router();

// GET all shifts
router.get('/', (req, res) => {
  const query = 'SELECT * FROM shifts';
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching shifts:', err);
      return res.status(500).send('Server error');
    }
    res.json(results);
  });
});

// POST a new shift (for testing purposes)
router.post('/', (req, res) => {
  const { shift_type, date, start_time, end_time, role, officer_name, sheet_name, sheet_row, sheet_col } = req.body;
  const query = `
    INSERT INTO shifts (shift_type, date, start_time, end_time, role, officer_name, sheet_name, sheet_row, sheet_col, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'open')
  `;
  db.query(query, [shift_type, date, start_time, end_time, role, officer_name, sheet_name, sheet_row, sheet_col], (err, result) => {
    if (err) {
      console.error('Error creating shift:', err);
      return res.status(500).send('Server error');
    }
    res.json({ message: 'Shift created successfully', shiftId: result.insertId });
  });
});

// // POST a coverage request
// router.post('/coverage-request', (req, res) => {
//   const { shiftId, requester_officer } = req.body;
//   const insertQuery = `
//     INSERT INTO coverage_requests (shift_id, requester_officer)
//     VALUES (?, ?)
//   `;
//   db.query(insertQuery, [shiftId, requester_officer], (err, result) => {
//     if (err) {
//       console.error('Error inserting coverage request:', err);
//       return res.status(500).json({ error: 'Server error' });
//     }
//     // Optionally update the shift status to "requested"
//     db.query('UPDATE shifts SET status = ? WHERE id = ?', ['requested', shiftId]);
//     res.json({ message: 'Coverage request submitted', requestId: result.insertId });
//   });
// });

// POST a coverage request with queue handling
router.post('/coverage-request', (req, res) => {
  const { shiftId, requester_officer } = req.body;
  
  // Determine the current count of pending requests for this shift
  const countQuery = 'SELECT COUNT(*) AS cnt FROM coverage_requests WHERE shift_id = ? AND status = "pending"';
  db.query(countQuery, [shiftId], (countErr, countResult) => {
    if (countErr) {
      console.error('Error counting coverage requests:', countErr);
      return res.status(500).json({ error: 'Server error' });
    }
    
    const queuePosition = countResult[0].cnt + 1;
    const insertQuery = `
      INSERT INTO coverage_requests (shift_id, requester_officer, queue_position)
      VALUES (?, ?, ?)
    `;
    db.query(insertQuery, [shiftId, requester_officer, queuePosition], (err, result) => {
      if (err) {
        console.error('Error inserting coverage request:', err);
        return res.status(500).json({ error: 'Server error' });
      }
      // Optionally update the shift status to "requested"
      db.query('UPDATE shifts SET status = ? WHERE id = ?', ['requested', shiftId]);
      res.json({ message: 'Coverage request submitted', requestId: result.insertId, queuePosition });
    });
  });
});


// POST coverage acceptance endpoint with detailed conflict feedback
router.post('/coverage-accept', (req, res) => {
  const { shiftId, acceptingOfficer } = req.body;

  // 1. Conflict check: if a conflict exists, return conflict details.
  const conflictQuery = `
    SELECT id, date, start_time, end_time, role, officer_name
    FROM shifts 
    WHERE officer_name = ? 
      AND date = (SELECT date FROM shifts WHERE id = ?)
      AND NOT (
            end_time <= (SELECT start_time FROM shifts WHERE id = ?)
            OR start_time >= (SELECT end_time FROM shifts WHERE id = ?)
          )
  `;
  db.query(conflictQuery, [acceptingOfficer, shiftId, shiftId, shiftId], (conflictErr, conflictResult) => {
    if (conflictErr) return res.status(500).json({ error: conflictErr.message });
    if (conflictResult.length > 0) {
      return res.status(409).json({
        error: 'Overlapping shift exists for this officer.',
        conflict: conflictResult[0]
      });
    }
    
    // 2. Update the shift: assign the officer and mark as 'assigned'
    const updateShiftQuery = `
      UPDATE shifts SET officer_name = ?, status = 'assigned'
      WHERE id = ? AND status = 'requested'
    `;
    db.query(updateShiftQuery, [acceptingOfficer, shiftId], (updateErr, updateResult) => {
      if (updateErr) return res.status(500).json({ error: updateErr.message });
      if (updateResult.affectedRows === 0) {
        return res.status(409).json({ error: 'Shift is no longer available for coverage' });
      }
      
      // 3. Update the coverage request to 'accepted'
      db.query('UPDATE coverage_requests SET status = ? WHERE shift_id = ?', ['accepted', shiftId], (covErr, covResult) => {
        if (covErr) return res.status(500).json({ error: covErr.message });
        
        // 4. Retrieve sheet mapping for this shift
        db.query('SELECT sheet_name, sheet_row, sheet_col FROM shifts WHERE id = ?', [shiftId], async (selErr, selResult) => {
          if (selErr) return res.status(500).json({ error: selErr.message });
          const { sheet_name, sheet_row, sheet_col } = selResult[0];
          
          // 5. Update the corresponding cell in the Google Sheet
          try {
            await updateShiftInSheet(sheet_name, sheet_row, sheet_col, acceptingOfficer);
            res.json({ message: 'Coverage accepted and sheet updated' });
          } catch (sheetErr) {
            res.status(500).json({ error: sheetErr.message });
          }
        });
      });
    });
  });
});

module.exports = router;
