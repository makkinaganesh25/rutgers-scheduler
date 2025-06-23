// backend/routes/sheets.js
const express = require('express');
const { GoogleSpreadsheet } = require('google-spreadsheet');
const path = require('path');
require('dotenv').config();

const router = express.Router();

// 1) Load sheet ID & creds filename
const SHEET_ID = process.env.GOOGLE_SHEET_ID;
if (!SHEET_ID) throw new Error('Missing env var GOOGLE_SHEET_ID');

const credsFilename =
  process.env.GOOGLE_SERVICE_ACCOUNT_FILE ||
  process.env.GOOGLE_APPLICATION_CREDENTIALS;
if (!credsFilename) {
  throw new Error(
    'Missing env var GOOGLE_SERVICE_ACCOUNT_FILE or GOOGLE_APPLICATION_CREDENTIALS'
  );
}
const creds = require(path.join(__dirname, '..', credsFilename));

async function getSheet() {
  const doc = new GoogleSpreadsheet(SHEET_ID);
  await doc.useServiceAccountAuth(creds);
  await doc.loadInfo();
  return doc.sheetsByIndex[0];
}

router.get('/', async (req, res) => {
  try {
    const sheet = await getSheet();
    // 2) Always load the rows
    const rowsRaw = await sheet.getRows();

    // 3) Determine headers
    let headers = sheet.headerValues;
    if (!Array.isArray(headers) || headers.length === 0) {
      if (rowsRaw.length > 0) {
        // take keys of the first row object
        headers = Object.keys(rowsRaw[0]).filter(
          k => !k.startsWith('_')   // skip internal props
        );
      } else {
        headers = [];
      }
    }

    // 4) Map rows into plain objects
    const rows = rowsRaw.map(r =>
      headers.reduce((obj, h) => ({ ...obj, [h]: r[h] }), {})
    );

    return res.json({ columns: headers, rows });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
});

router.post('/update', async (req, res) => {
  try {
    const sheet = await getSheet();
    const { rows } = req.body;
    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(400).json({ error: 'No rows provided to update.' });
    }

    // clear existing and reset headers
    await sheet.clearRows();
    await sheet.setHeaderRow(Object.keys(rows[0]));
    await sheet.addRows(rows);

    return res.json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
