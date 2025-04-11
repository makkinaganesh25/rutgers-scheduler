require('dotenv').config();  // Load environment variables
const mysql = require('mysql2');

// MySQL connection setup using environment variables
const db = mysql.createConnection({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE
});

// Function to get shift_type_id based on shift name
async function getShiftTypeId(shiftName) {
  return new Promise((resolve, reject) => {
    db.query(
      'SELECT id FROM shift_types WHERE shift_name = ?',
      [shiftName],
      (err, results) => {
        if (err) return reject(err);
        if (results.length > 0) resolve(results[0].id);
        else reject(new Error(`Shift type '${shiftName}' not found`));
      }
    );
  });
}

// Function to add permanent shifts based on static schedule data
async function addPermanentShifts(scheduleData) {
  for (const { shiftType, day, time, officerNames } of scheduleData) {
    try {
      const shiftTypeId = await getShiftTypeId(shiftType);

      for (const officerName of officerNames) {
        db.query(
          `INSERT INTO daily_assignments (shift_type_id, date, campus, oic, rider, hours, status)
           VALUES (?, ?, ?, ?, ?, ?, 'assigned')
           ON DUPLICATE KEY UPDATE oic=VALUES(oic), rider=VALUES(rider)`,
          [shiftTypeId, day, officerName, time, 'N/A', 'N/A'],  // Customize as per your table structure
          (err) => {
            if (err) console.error(`Error inserting ${shiftType} for ${officerName}:`, err);
          }
        );
      }
      console.log(`Shift type ${shiftType} for ${day} added successfully`);
    } catch (error) {
      console.error(error);
    }
  }
}

// Function to close MySQL connection
function closeConnection() {
  db.end((err) => {
    if (err) console.error('Error closing database connection:', err);
    else console.log('Database connection closed.');
  });
}

module.exports = { getShiftTypeId, addPermanentShifts, closeConnection };
