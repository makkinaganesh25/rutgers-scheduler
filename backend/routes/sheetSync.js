// backend/routes/sheetSync.js
require('dotenv').config();
const express = require('express');
const { GoogleSpreadsheet } = require('google-spreadsheet');
const path    = require('path');
const db      = require('../db');

const router = express.Router();
const SHEET_ID = process.env.GOOGLE_SHEET_ID;
if (!SHEET_ID) {
  throw new Error('Missing env var GOOGLE_SHEET_ID');
}

const keyFile = process.env.GOOGLE_APPLICATION_CREDENTIALS;
if (!keyFile) {
  throw new Error('Missing env var GOOGLE_APPLICATION_CREDENTIALS');
}

// resolve to absolute path
const credsPath = path.isAbsolute(keyFile)
  ? keyFile
  : path.join(__dirname, '..', keyFile);
const creds = require(credsPath);

async function getDoc() {
  const doc = new GoogleSpreadsheet(SHEET_ID);
  await doc.useServiceAccountAuth(creds);
  await doc.loadInfo();
  return doc;
}

async function appendEventToSummary(doc, ev) {
  let summary = doc.sheetsByTitle['Special Events'];
  if (!summary) {
    summary = await doc.addSheet({ title: 'Special Events', headerValues: [] });
    await summary.setHeaderRow(['DATE','NAME','ASSIGNMENT','TIME IN','TIME OUT']);
  }

  const rows = [];

  rows.push({
    DATE: '',
    NAME: '',
    ASSIGNMENT: `${ev.name} (Start – ${ev.date.toISOString().slice(0,10)})`,
    'TIME IN': '',
    'TIME OUT': ''
  });

  if (ev.description) {
    rows.push({
      DATE: '',
      NAME: ev.description,
      ASSIGNMENT: '',
      'TIME IN': '',
      'TIME OUT': ''
    });
  }

  rows.push({
    DATE: 'DATE',
    NAME: 'NAME',
    ASSIGNMENT: 'ASSIGNMENT',
    'TIME IN': 'TIME IN',
    'TIME OUT': 'TIME OUT'
  });

  const [slots] = await db.query(
    `SELECT s.assignment, s.time_in, s.time_out, u.first_name AS name
       FROM event_slots s
       LEFT JOIN users u ON u.id = s.filled_by
      WHERE s.event_id = ?`,
    [ev.id]
  );

  for (const s of slots) {
    rows.push({
      DATE:       ev.date.toISOString().slice(0,10),
      NAME:       s.name || '',
      ASSIGNMENT: s.assignment,
      'TIME IN':  s.time_in || '',
      'TIME OUT': s.time_out || ''
    });
  }

  rows.push({ DATE:'', NAME:'', ASSIGNMENT:'', 'TIME IN':'', 'TIME OUT':'' });
  await summary.addRows(rows);
}

async function syncPerEventTabs(doc, events) {
  for (const ev of events) {
    let sheet = doc.sheetsByTitle[ev.name];
    if (!sheet) {
      sheet = await doc.addSheet({ title: ev.name, headerValues: [] });
    }
    await sheet.clearRows();
    await sheet.setHeaderRow(['DATE','NAME','ASSIGNMENT','TIME IN','TIME OUT']);

    const [slots] = await db.query(
      `SELECT s.assignment, s.time_in, s.time_out, u.first_name AS name
         FROM event_slots s
         LEFT JOIN users u ON u.id = s.filled_by
        WHERE s.event_id = ?`,
      [ev.id]
    );

    const rows = slots.map(s => ({
      DATE:       ev.date.toISOString().slice(0,10),
      NAME:       s.name || '',
      ASSIGNMENT: s.assignment,
      'TIME IN':  s.time_in || '',
      'TIME OUT': s.time_out || ''
    }));

    await sheet.addRows(rows);
  }
}

router.post('/append', async (req, res) => {
  try {
    const { eventId } = req.body;
    const doc = await getDoc();
    const [[ev]] = await db.query(`SELECT * FROM events WHERE id = ?`, [eventId]);
    if (!ev) return res.status(404).json({ error: 'Not found' });
    await appendEventToSummary(doc, ev);
    await syncPerEventTabs(doc, [ev]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.post('/full', async (req, res) => {
  try {
    const doc = await getDoc();
    const [events] = await db.query(`SELECT * FROM events ORDER BY date`);
    const summary = doc.sheetsByTitle['Special Events'];
    if (summary) await summary.clearRows();
    for (const ev of events) {
      await appendEventToSummary(doc, ev);
    }
    await syncPerEventTabs(doc, events);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
