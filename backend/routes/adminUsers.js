const express           = require('express');
const bcrypt            = require('bcrypt');
const authenticateToken = require('../middleware/auth');
const db                = require('../db');

const router = express.Router();
const ADMIN_ROLES = ['BS', 'LT'];

// 0) Auth & Role Check
router.use(authenticateToken);
router.use((req, res, next) => {
  if (!ADMIN_ROLES.includes(req.user.user_rank)) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
});

// 1) List all users (optionally include inactive)
router.get('/', async (req, res) => {
  const showInactive = req.query.showInactive === 'true';
  const q = `
    SELECT id, username, first_name, email, phone, user_rank, manager_id,
           status = 'active' AS active
      FROM users
     ${!showInactive ? `WHERE status='active'` : ''}
     ORDER BY first_name
  `;
  const [rows] = await db.query(q);
  res.json(rows);
});

// 2) Create new user
router.post('/', async (req, res) => {
  try {
    let {
      username, password, first_name,
      email, phone, user_rank, manager_id
    } = req.body;

    // coerce invalid manager_id to NULL
    manager_id = Number(manager_id) || null;

    const hash = await bcrypt.hash(password, 10);

    const insertQ = `
      INSERT INTO users
        (username, password, first_name, email, phone, user_rank, manager_id, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'active')
    `;
    const [result] = await db.query(insertQ, [
      username, hash, first_name, email, phone, user_rank, manager_id
    ]);

    const [newUser] = await db.query(
      `SELECT id, username, first_name, email, phone, user_rank, manager_id,
              status = 'active' AS active
         FROM users WHERE id = ?`,
      [result.insertId]
    );
    res.status(201).json(newUser[0]);

  } catch (err) {
    console.error('AdminUsers POST error:', err);
    if (err.errno === 1452) {
      return res.status(400).json({ error: 'Supervisor (manager_id) does not exist' });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

// 3) Update user (incl. status toggle)
router.put('/:id', async (req, res) => {
  try {
    let {
      first_name, email, phone,
      user_rank, manager_id, active
    } = req.body;

    manager_id = Number(manager_id) || null;
    const status = active ? 'active' : 'inactive';

    const updateQ = `
      UPDATE users
         SET first_name = ?, email = ?, phone = ?, user_rank = ?, manager_id = ?, status = ?
       WHERE id = ?
    `;
    await db.query(updateQ, [
      first_name, email, phone, user_rank, manager_id, status, req.params.id
    ]);

    const [rows] = await db.query(
      `SELECT id, username, first_name, email, phone, user_rank, manager_id,
              status = 'active' AS active
         FROM users WHERE id = ?`,
      [req.params.id]
    );
    res.json(rows[0]);

  } catch (err) {
    console.error('AdminUsers PUT error:', err);
    if (err.errno === 1452) {
      return res.status(400).json({ error: 'Supervisor (manager_id) does not exist' });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

// 4) Hard delete
router.delete('/:id', async (req, res) => {
  await db.query('DELETE FROM users WHERE id = ?', [req.params.id]);
  res.status(204).end();
});

module.exports = router;
