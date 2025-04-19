// backend/routes/sheetsApi.js
require('dotenv').config();
const { google } = require('googleapis');
const path     = require('path');

const auth   = new google.auth.GoogleAuth({
  keyFile : path.join(__dirname, process.env.GOOGLE_CREDENTIALS_JSON),
  scopes  : ['https://www.googleapis.com/auth/spreadsheets']
});
const sheets = google.sheets({ version: 'v4', auth });
const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;

/**
 * 1-indexed → A, B, …, Z, AA, AB, …
 */
function columnToLetter(col) {
  let letter = '';
  while (col > 0) {
    const mod = (col - 1) % 26;
    letter    = String.fromCharCode(65 + mod) + letter;
    col       = Math.floor((col - 1) / 26);
  }
  return letter;
}

/**
 * Find every cell matching `needle` (case‑insensitive).
 */
function findAll(data, needle) {
  const lc = needle.trim().toLowerCase();
  const hits = [];
  data.forEach((row, r) => {
    (row || []).forEach((cell, c) => {
      if ((cell || '').trim().toLowerCase() === lc) {
        hits.push({ r, c });
      }
    });
  });
  return hits;
}

/**
 * Main: locate the correct row & col for this shift by:
 *  1) finding all PSB LOBBY labels
 *  2) for each, checking the date‐row above it for our target date
 *  3) when found, compute the time‐slot row offset and return A1 indices
 */
async function locateShiftCell(tabName, shiftDate, startTime) {
  // pull A:Z
  const resp = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${tabName}!A:Z`
  });
  const data = resp.data.values || [];

  // normalize date to M/D/YYYY
  const dt      = new Date(shiftDate);
  const dateStr = `${dt.getMonth() + 1}/${dt.getDate()}/${dt.getFullYear()}`;

  // find all PSB LOBBY anchors
  const anchors = findAll(data, 'PSB LOBBY');
  if (!anchors.length) {
    throw new Error(`Could not find any "PSB LOBBY" labels in tab "${tabName}"`);
  }

  // scan each anchor for the matching date in the row above it
  for (const { r: labelRow } of anchors) {
    const dateRow = labelRow - 1;
    if (dateRow < 0) continue;            // no header above
    const header = data[dateRow] || [];
    const dateCol = header.findIndex(cell => (cell || '').trim() === dateStr);
    if (dateCol < 0) continue;            // this week doesn’t match

    // decide morning vs afternoon block
    const morningCutoff = '12:00:00';
    const blockOffset   = startTime < morningCutoff ? 1 : 2;
    const targetRow     = labelRow + blockOffset;

    // return 1-based indices
    return {
      row: targetRow + 1,
      col: dateCol + 1
    };
  }

  // none of the PSB LOBBY blocks contained our date
  throw new Error(`Could not find date "${dateStr}" in any PSB LOBBY block`);
}

/**
 * Wraps sheet‑names with quotes if needed.
 */
function quoteName(name) {
  return /[\s'!]/.test(name)
    ? `'${name.replace(/'/g, "\\'")}'`
    : name;
}

/**
 * High‑level update: locate & write.
 */
async function updateShiftInSheetDynamic(tabName, shiftDate, startTime, newValue) {
  const { row, col } = await locateShiftCell(tabName, shiftDate, startTime);
  const colLetter    = columnToLetter(col);
  const safeName     = quoteName(tabName);
  const range        = `${safeName}!${colLetter}${row}`;

  console.log(`[SheetsAPI] writing "${newValue}" → ${range}`);
  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range,
    valueInputOption: 'RAW',
    resource: { values: [[newValue]] }
  });
}

module.exports = { updateShiftInSheetDynamic };
