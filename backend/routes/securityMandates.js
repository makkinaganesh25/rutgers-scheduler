// routes/securityMandates.js
const router = require('express').Router();
const db = require('../db');
router.post('/', async (req, res) => {
  const { shiftId, officerId, reason } = req.body;
  const mandatorId = req.user.securityOfficerId;
  // 1) fetch shift
  const [shift] = await db.query(
    `SELECT date, start_time, end_time FROM shifts WHERE id=?`, [shiftId]
  );
  // 2) overlap check
  const overlap = await db.query(`
    SELECT 1 FROM shifts
     WHERE officer_name_id=? AND date=?
       AND NOT (end_time<=? OR start_time>=?)`,
    [officerId, shift.date, shift.start_time, shift.end_time]
  );
  if (overlap.length) return res.status(409).json({ error:'Overlap' });
  // 3) hours-per-day
  const assigned = await db.query(
    `SELECT start_time,end_time FROM shifts WHERE
       officer_name_id=? AND date=?`,
    [officerId, shift.date]
  );
  let hours = assigned
    .reduce((sum, s) => sum + diffHours(s.start_time,s.end_time), 0)
    + diffHours(shift.start_time,shift.end_time);
  if (hours > 16) return res.status(409).json({ error:'MaxHoursExceeded' });
  // 4) leave check
  const onLeave = await db.query(`
    SELECT 1 FROM security_leave_requests 
     WHERE officer_id=? AND status='approved'
       AND start_date<=? AND end_date>=?`,
    [officerId, shift.date, shift.date]
  );
  if (onLeave.length) return res.status(409).json({ error:'OnLeave' });
  // 5) success → assign
  await db.query(
    `UPDATE shifts SET officer_name_id=?,status='assigned' WHERE id=?`,
    [officerId, shiftId]
  );
  await db.query(
    `INSERT INTO security_mandate_assignments
      (shift_id,mandated_by,mandated_officer,reason)
     VALUES (?,?,?,?)`,
    [shiftId, mandatorId, officerId, reason]
  );
  res.json({ success:true });
});
module.exports = router;
