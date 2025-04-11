//this is the previosu working one we changed to use this according to the new chatgpt logic
// require('dotenv').config();
// const { google } = require('googleapis');
// const mysql = require('mysql2');
// const path = require('path');

// // Initialize Google Sheets API client
// const auth = new google.auth.GoogleAuth({
//   keyFile: path.join(__dirname, process.env.GOOGLE_KEY_FILE),
//   scopes: ['https://www.googleapis.com/auth/spreadsheets']
// });
// const sheets = google.sheets({ version: 'v4', auth });

// // MySQL connection setup
// const db = mysql.createConnection({
//   host: process.env.MYSQL_HOST,
//   user: process.env.MYSQL_USER,
//   password: process.env.MYSQL_PASSWORD,
//   database: process.env.MYSQL_DATABASE
// });

// // Helper function to get shift_type_id based on shift name
// function getShiftTypeId(shiftName) {
//   return new Promise((resolve, reject) => {
//     db.query('SELECT id FROM shift_types WHERE shift_name = ?', [shiftName], (err, results) => {
//       if (err) reject(err);
//       else if (results.length > 0) resolve(results[0].id);
//       else reject(new Error(`Shift type '${shiftName}' not found`));
//     });
//   });
// }

// // Function to insert a shift posting
// function insertShiftPosting(shiftTypeId, shiftTime, day, assignedOfficer) {
//   return new Promise((resolve, reject) => {
//     db.query(
//       `INSERT INTO shift_postings (shift_type_id, shift_time, day, assigned_officer)
//        VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE assigned_officer=VALUES(assigned_officer)`,
//       [shiftTypeId, shiftTime, day, assignedOfficer],
//       (err) => {
//         if (err) reject(err);
//         else resolve();
//       }
//     );
//   });
// }

// // Function to parse and insert the static schedule from Google Sheets
// async function processStaticSchedule() {
//   const authClient = await auth.getClient();
//   const spreadsheetId = process.env.GOOGLE_SHEET_ID;

//   try {
//     // Get the list of sheet names
//     const sheetMetadata = await sheets.spreadsheets.get({
//       auth: authClient,
//       spreadsheetId
//     });
//     const sheetNames = sheetMetadata.data.sheets.map(sheet => sheet.properties.title);

//     // Process each sheet individually
//     for (const sheetName of sheetNames) {
//       const response = await sheets.spreadsheets.values.get({
//         auth: authClient,
//         spreadsheetId,
//         range: `${sheetName}!A2:H`
//       });
//       const rows = response.data.values;

//       // If rows are found, process them
//       if (rows && rows.length) {
//         const shiftTypeId = await getShiftTypeId(sheetName); // Use sheet name as shift type

//         for (const row of rows) {
//           const [time, ...officerAssignments] = row.slice(1); // Skip first column as it's header
//           const days = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

//           // Map officer assignments to the days of the week
//           for (let i = 0; i < officerAssignments.length; i++) {
//             const officerName = officerAssignments[i];
//             const day = days[i];
//             if (officerName && officerName !== '----------') {
//               await insertShiftPosting(shiftTypeId, time, day, officerName);
//             }
//           }
//         }
//       }
//     }
//     console.log('Static schedule processed and inserted into the database.');

//   } catch (error) {
//     console.error('Error processing static schedule:', error);
//   } finally {
//     db.end();
//   }
// }

// // Start the processing function
// processStaticSchedule().then(() => {
//   console.log('Schedule processing complete.');
// });

// sheetsApi.js
require('dotenv').config();
const { google } = require('googleapis');
const mysql = require('mysql2');
const path = require('path');
const db = require('./db');

const auth = new google.auth.GoogleAuth({
  keyFile: path.join(__dirname, process.env.GOOGLE_CREDENTIALS_JSON),
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});
const sheets = google.sheets({ version: 'v4', auth });

// Example helper to get shift_type_id if you have a shift_types table
function getShiftTypeId(shiftName) {
  return new Promise((resolve, reject) => {
    db.query('SELECT id FROM shift_types WHERE shift_name = ?', [shiftName], (err, results) => {
      if (err) reject(err);
      else if (results.length > 0) resolve(results[0].id);
      else reject(new Error(`Shift type '${shiftName}' not found`));
    });
  });
}

// Example function to process a static schedule from a sheet
async function processStaticSchedule() {
  const authClient = await auth.getClient();
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;

  try {
    // Get metadata to list sheet names
    const sheetMetadata = await sheets.spreadsheets.get({
      auth: authClient,
      spreadsheetId
    });
    const sheetNames = sheetMetadata.data.sheets.map(sheet => sheet.properties.title);

    // Loop over sheets and process each
    for (const sheetName of sheetNames) {
      const response = await sheets.spreadsheets.values.get({
        auth: authClient,
        spreadsheetId,
        range: `${sheetName}!A2:H`
      });
      const rows = response.data.values;
      if (rows && rows.length) {
        // Suppose we use sheetName as shift_type.
        const shiftTypeId = await getShiftTypeId(sheetName);
        for (const row of rows) {
          // Parse the row as needed, then insert into a unified shifts table.
          // For example:
          const [time, ...officerAssignments] = row.slice(1);
          const days = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
          for (let i = 0; i < officerAssignments.length; i++) {
            const officerName = officerAssignments[i];
            const day = days[i];
            if (officerName && officerName !== '----------') {
              db.query(
                `INSERT INTO shifts (shift_type, date, start_time, end_time, assigned_user_id)
                 VALUES (?, ?, ?, ?, NULL)
                 ON DUPLICATE KEY UPDATE assigned_user_id = VALUES(assigned_user_id)`,
                [sheetName, /* date parsed from row */, time.split('-')[0], time.split('-')[1]],
                (err) => {
                  if (err) console.error(err);
                }
              );
            }
          }
        }
      }
    }
    console.log('Static schedule processed.');
  } catch (error) {
    console.error('Error processing static schedule:', error);
  } finally {
    db.end();
  }
}

processStaticSchedule();

module.exports = {
  processStaticSchedule
};
