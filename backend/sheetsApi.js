// // sheetsApi.js
// require('dotenv').config();
// const { google } = require('googleapis');
// const path = require('path');

// const auth = new google.auth.GoogleAuth({
//   keyFile: path.join(__dirname, process.env.GOOGLE_CREDENTIALS_JSON),
//   scopes: ['https://www.googleapis.com/auth/spreadsheets']
// });
// const sheets = google.sheets({ version: 'v4', auth });

// /**
//  * Convert a column number (1-indexed) to its corresponding letter.
//  * This simple function works for columns A-Z.
//  */
// function columnToLetter(col) {
//   return String.fromCharCode(64 + col);
// }

// /**
//  * Update a cell in a given sheet.
//  * @param {string} sheetName - Name of the sheet (tab).
//  * @param {number} row - 1-indexed row number.
//  * @param {number} col - 1-indexed column number.
//  * @param {string} newValue - New value to set.
//  */
// async function updateShiftInSheet(sheetName, row, col, newValue) {
//   const colLetter = columnToLetter(col);
//   const range = `${sheetName}!${colLetter}${row}`;
//   await sheets.spreadsheets.values.update({
//     spreadsheetId: process.env.GOOGLE_SHEET_ID,
//     range,
//     valueInputOption: 'RAW',
//     resource: {
//       values: [[ newValue ]]
//     }
//   });
// }

// module.exports = { updateShiftInSheet };


// backend/sheetsApi.js
require('dotenv').config();
const { google } = require('googleapis');
const path = require('path');

const auth = new google.auth.GoogleAuth({
  keyFile: path.join(__dirname, process.env.GOOGLE_CREDENTIALS_JSON),
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});
const sheets = google.sheets({ version: 'v4', auth });

/**
 * Convert a column number (1-indexed) to a letter (for columns A-Z).
 */
function columnToLetter(col) {
  return String.fromCharCode(64 + col);
}

/**
 * Updates a cell in a Google Sheet.
 * @param {string} sheetName - The name of the sheet (tab).
 * @param {number} row - The 1-indexed row number.
 * @param {number} col - The 1-indexed column number.
 * @param {string} newValue - The new value to set in the cell.
 */
async function updateShiftInSheet(sheetName, row, col, newValue) {
  const colLetter = columnToLetter(col);
  const range = `${sheetName}!${colLetter}${row}`;
  await sheets.spreadsheets.values.update({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range,
    valueInputOption: 'RAW',
    resource: { values: [[newValue]] }
  });
}

module.exports = { updateShiftInSheet };
