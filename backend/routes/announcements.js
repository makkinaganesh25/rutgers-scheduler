// // backend/routes/announcements.js
// const express    = require('express');
// const auth       = require('../middleware/auth');
// const multer     = require('multer');
// const { uploadFile, deleteFile, getPublicUrl } = require('../utils/gcs');
// const db         = require('../db');
// const { ANNOUNCEMENT_CREATOR_ROLES } = require('../config/roles');

// const router = express.Router();
// const upload = multer(); // in-memory storage

// function requireCreator(req, res, next) {
//   if (!ANNOUNCEMENT_CREATOR_ROLES.includes(req.user.user_rank)) {
//     return res.status(403).json({ error: 'Forbidden' });
//   }
//   next();
// }

// // GET all announcements
// router.get('/', auth, async (req, res) => {
//   const [anns] = await db.query(`
//     SELECT a.*, u.username AS created_by_name
//       FROM announcements a
//       JOIN users u ON u.id = a.created_by
//     ORDER BY a.created_at DESC
//   `);

//   // for each announcement, fetch its files + signed URLs
//   for (const a of anns) {
//     const [files] = await db.query(`
//       SELECT id, filename, gcs_path
//         FROM announcement_files
//        WHERE announcement_id = ?
//     `, [a.id]);

//     // await every getPublicUrl
//     const fileInfos = await Promise.all(files.map(async f => ({
//       id:       f.id,
//       filename: f.filename,
//       url:      await getPublicUrl(f.gcs_path)
//     })));

//     a.files = fileInfos;
//   }

//   res.json(anns);
// });

// // POST create a new announcement
// router.post('/', auth, requireCreator, async (req, res) => {
//   const { title, body } = req.body;
//   const [r] = await db.query(`
//     INSERT INTO announcements (title, body, created_by)
//     VALUES (?, ?, ?)
//   `, [title, body, req.user.id]);
//   res.status(201).json({ id: r.insertId });
// });

// // PUT update announcement
// router.put('/:id', auth, requireCreator, async (req, res) => {
//   const { title, body } = req.body;
//   await db.query(`
//     UPDATE announcements
//        SET title = ?, body = ?, updated_at = NOW()
//      WHERE id = ?
//   `, [title, body, req.params.id]);
//   res.json({ success: true });
// });

// // DELETE announcement + its files
// router.delete('/:id', auth, requireCreator, async (req, res) => {
//   const annId = req.params.id;
//   const [files] = await db.query(`
//     SELECT gcs_path
//       FROM announcement_files
//      WHERE announcement_id = ?
//   `, [annId]);

//   // remove each from GCS
//   await Promise.all(files.map(f => deleteFile(f.gcs_path)));

//   // then delete the announcement (ON DELETE CASCADE removes files rows)
//   await db.query(`DELETE FROM announcements WHERE id = ?`, [annId]);
//   res.json({ success: true });
// });

// // POST upload attachments
// router.post(
//   '/:id/files',
//   auth,
//   requireCreator,
//   upload.array('files'),
//   async (req, res) => {
//     const annId = req.params.id;
//     const results = [];

//     for (const f of req.files) {
//       const dest = `announcements/${annId}/${Date.now()}_${f.originalname}`;
//       // upload and get a signed URL
//       const publicUrl = await uploadFile(f.buffer, dest, f.mimetype);

//       // record it in DB
//       const [r] = await db.query(`
//         INSERT INTO announcement_files
//           (announcement_id, filename, gcs_path)
//         VALUES (?, ?, ?)
//       `, [annId, f.originalname, dest]);

//       results.push({
//         id:       r.insertId,
//         filename: f.originalname,
//         url:      publicUrl
//       });
//     }

//     res.json(results);
//   }
// );

// module.exports = router;

// // backend/routes/announcements.js
// const express    = require('express');
// const auth       = require('../middleware/auth');
// const multer     = require('multer');
// const { uploadFile, deleteFile, getPublicUrl } = require('../utils/gcs');
// const db         = require('../db');
// const { ANNOUNCEMENT_CREATOR_ROLES } = require('../config/roles');

// const router = express.Router();
// const upload = multer();

// function requireCreator(req, res, next) {
//   if (!ANNOUNCEMENT_CREATOR_ROLES.includes(req.user.user_rank)) {
//     return res.status(403).json({ error: 'Forbidden' });
//   }
//   next();
// }

// // GET all announcements
// router.get('/', auth, async (req, res) => {
//   const [anns] = await db.query(
//     `SELECT a.*, u.username AS created_by_name
//        FROM announcements a
//        JOIN users u ON u.id = a.created_by
//        ORDER BY a.created_at DESC`
//   );
//   for (let a of anns) {
//     const [files] = await db.query(
//       `SELECT id, filename, gcs_path
//          FROM announcement_files
//         WHERE announcement_id = ?`,
//       [a.id]
//     );
//     a.files = files.map(f => ({
//       id:       f.id,
//       filename: f.filename,
//       url:      getPublicUrl(f.gcs_path)
//     }));
//   }
//   res.json(anns);
// });

// // POST create
// router.post('/', auth, requireCreator, async (req, res) => {
//   const { title, body } = req.body;
//   const [r] = await db.query(
//     `INSERT INTO announcements (title, body, created_by)
//          VALUES (?,?,?)`,
//     [title, body, req.user.id]
//   );
//   res.status(201).json({ id: r.insertId });
// });

// // PUT update
// router.put('/:id', auth, requireCreator, async (req, res) => {
//   const { title, body } = req.body;
//   await db.query(
//     `UPDATE announcements
//         SET title=?, body=?, updated_at=NOW()
//       WHERE id=?`,
//     [title, body, req.params.id]
//   );
//   res.json({ success: true });
// });

// // DELETE announcement + all its files
// router.delete('/:id', auth, requireCreator, async (req, res) => {
//   const annId = req.params.id;
//   // fetch and delete from GCS
//   const [files] = await db.query(
//     `SELECT gcs_path FROM announcement_files WHERE announcement_id=?`,
//     [annId]
//   );
//   await Promise.all(files.map(f => deleteFile(f.gcs_path)));
//   // delete DB rows via cascade
//   await db.query(`DELETE FROM announcements WHERE id=?`, [annId]);
//   res.json({ success: true });
// });

// // DELETE *all* files for an announcement (used on edit)
// router.delete('/:id/files', auth, requireCreator, async (req, res) => {
//   const annId = req.params.id;
//   const [files] = await db.query(
//     `SELECT gcs_path FROM announcement_files WHERE announcement_id=?`,
//     [annId]
//   );
//   await Promise.all(files.map(f => deleteFile(f.gcs_path)));
//   await db.query(
//     `DELETE FROM announcement_files WHERE announcement_id=?`,
//     [annId]
//   );
//   res.json({ success: true });
// });

// // POST upload attachments
// router.post(
//   '/:id/files',
//   auth, requireCreator,
//   upload.array('files'),
//   async (req, res) => {
//     const annId = req.params.id;
//     const results = [];
//     for (const f of req.files) {
//       const dest      = `announcements/${annId}/${Date.now()}_${f.originalname}`;
//       const publicUrl = await uploadFile(f.buffer, dest, f.mimetype);
//       const [r] = await db.query(
//         `INSERT INTO announcement_files
//            (announcement_id, filename, gcs_path)
//          VALUES (?,?,?)`,
//         [annId, f.originalname, dest]
//       );
//       results.push({ id: r.insertId, filename: f.originalname, url: publicUrl });
//     }
//     res.json(results);
//   }
// );

// module.exports = router;

// backend/routes/announcements.js
require('dotenv').config();
const express = require('express');
const auth    = require('../middleware/auth');
const multer  = require('multer');
const db      = require('../db');
const { ANNOUNCEMENT_CREATOR_ROLES } = require('../config/roles');
const { Storage } = require('@google-cloud/storage');

const storage = new Storage();
const bucket  = storage.bucket(process.env.GCS_BUCKET_NAME);

const router = express.Router();
const upload = multer();

// only supervisors & DR can create/update/delete
function requireCreator(req, res, next) {
  if (!ANNOUNCEMENT_CREATOR_ROLES.includes(req.user.user_rank)) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
}

// helper: obtain signed URL valid 7 days
async function signedUrlFor(path) {
  const file = bucket.file(path);
  const [url] = await file.getSignedUrl({
    action:  'read',
    expires: Date.now() + 7 * 24 * 3600 * 1000
  });
  return url;
}

// GET list (supports ?starred=true)
router.get('/', auth, async (req, res) => {
  const onlyStarred = req.query.starred === 'true';
  const uid         = req.user.id;

  const [anns] = await db.query(`
    SELECT a.id,a.title,a.body,a.created_by,a.created_at,a.updated_at,
           u.username AS created_by_name,
           IF(sa.user_id IS NULL, FALSE, TRUE) AS starred
      FROM announcements a
      JOIN users u ON u.id=a.created_by
      LEFT JOIN starred_announcements sa
        ON sa.announcement_id=a.id AND sa.user_id=?
     ${onlyStarred ? 'WHERE sa.user_id IS NOT NULL' : ''}
     ORDER BY a.created_at DESC
  `, [uid]);

  for (let a of anns) {
    const [files] = await db.query(`
      SELECT id, filename, gcs_path
        FROM announcement_files
       WHERE announcement_id=?
    `, [a.id]);

    a.files = await Promise.all(files.map(async f => ({
      id:       f.id,
      filename: f.filename,
      url:      await signedUrlFor(f.gcs_path)
    })));
  }

  res.json(anns);
});

// POST create
router.post('/', auth, requireCreator, async (req, res) => {
  const { title, body } = req.body;
  const [r] = await db.query(`
    INSERT INTO announcements (title, body, created_by)
    VALUES (?,?,?)
  `, [title, body, req.user.id]);
  res.status(201).json({ id: r.insertId });
});

// PUT update title/body
router.put('/:id', auth, requireCreator, async (req, res) => {
  const { title, body } = req.body;
  await db.query(`
    UPDATE announcements
       SET title=?, body=?, updated_at=NOW()
     WHERE id=?
  `, [title, body, req.params.id]);
  res.json({ success: true });
});

// DELETE announcement + files
router.delete('/:id', auth, requireCreator, async (req, res) => {
  const annId = req.params.id;
  // delete files in GCS
  const [files] = await db.query(`
    SELECT gcs_path FROM announcement_files
     WHERE announcement_id=?
  `, [annId]);
  await Promise.all(files.map(f => bucket.file(f.gcs_path).delete()));
  // cascade delete announcements + files
  await db.query(`DELETE FROM announcements WHERE id=?`, [annId]);
  res.json({ success: true });
});

// DELETE all attachments for an announcement
router.delete('/:id/files', auth, requireCreator, async (req, res) => {
  const annId = req.params.id;
  const [files] = await db.query(`
    SELECT gcs_path FROM announcement_files
     WHERE announcement_id=?
  `, [annId]);
  await Promise.all(files.map(f => bucket.file(f.gcs_path).delete()));
  await db.query(`
    DELETE FROM announcement_files
     WHERE announcement_id=?
  `, [annId]);
  res.json({ success: true });
});

// POST upload attachments
router.post(
  '/:id/files',
  auth, requireCreator,
  upload.array('files'),
  async (req, res) => {
    const annId = req.params.id;
    const out   = [];
    for (const f of req.files) {
      const dest = `announcements/${annId}/${Date.now()}_${f.originalname}`;
      await bucket.file(dest).save(f.buffer, { contentType: f.mimetype });
      const [r] = await db.query(`
        INSERT INTO announcement_files
          (announcement_id, filename, gcs_path)
        VALUES (?,?,?)
      `, [annId, f.originalname, dest]);
      const url = await signedUrlFor(dest);
      out.push({ id: r.insertId, filename: f.originalname, url });
    }
    res.json(out);
  }
);

// POST the “star” for this user
router.post('/:id/star', auth, async (req, res) => {
  await db.query(`
    INSERT IGNORE INTO starred_announcements (user_id, announcement_id)
    VALUES (?,?)
  `, [req.user.id, req.params.id]);
  res.json({ success: true });
});

// DELETE the “star” for this user
router.delete('/:id/star', auth, async (req, res) => {
  await db.query(`
    DELETE FROM starred_announcements
     WHERE user_id=? AND announcement_id=?
  `, [req.user.id, req.params.id]);
  res.json({ success: true });
});

module.exports = router;
