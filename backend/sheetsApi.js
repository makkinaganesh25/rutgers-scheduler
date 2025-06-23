// backend/routes/sheetsApi.js
require('dotenv').config();
const { google } = require('googleapis');
const path       = require('path');

if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  throw new Error('Missing GOOGLE_APPLICATION_CREDENTIALS env var');
}

const credPath = path.isAbsolute(process.env.GOOGLE_APPLICATION_CREDENTIALS)
  ? process.env.GOOGLE_APPLICATION_CREDENTIALS
  : path.join(__dirname, '..', process.env.GOOGLE_APPLICATION_CREDENTIALS);

const auth = new google.auth.GoogleAuth({
  keyFile: credPath,
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

const sheets = google.sheets({ version: 'v4', auth });
const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;

function columnToLetter(col) {
  let letter = '';
  while (col > 0) {
    const mod = (col - 1) % 26;
    letter    = String.fromCharCode(65 + mod) + letter;
    col       = Math.floor((col - 1) / 26);
  }
  return letter;
}

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

async function locateShiftCell(tabName, shiftDate, startTime) {
  const resp = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${tabName}!A:Z`
  });
  const data = resp.data.values || [];
  const dt      = new Date(shiftDate);
  const dateStr = `${dt.getMonth() + 1}/${dt.getDate()}/${dt.getFullYear()}`;
  const anchors = findAll(data, 'PSB LOBBY');
  for (const { r: labelRow } of anchors) {
    const header = data[labelRow - 1] || [];
    const dateCol = header.findIndex(cell => (cell || '').trim() === dateStr);
    if (dateCol < 0) continue;
    const morningCutoff = '12:00:00';
    const blockOffset   = startTime < morningCutoff ? 1 : 2;
    const targetRow     = labelRow + blockOffset;
    return { row: targetRow + 1, col: dateCol + 1 };
  }
  throw new Error(`Could not find date "${dateStr}" in tab "${tabName}"`);
}

function quoteName(name) {
  return /[\s'!]/.test(name)
    ? `'${name.replace(/'/g, "\\'")}'`
    : name;
}

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
