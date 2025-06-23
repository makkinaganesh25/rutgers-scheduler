// File: backend/routes/overview.js
const express           = require('express');
const router            = express.Router();
const db                = require('../db');
const authenticateToken = require('../middleware/auth');

// Recursive helper:
function buildTree(users, managerId) {
  return users
    .filter(u => u.manager_id === managerId)
    .map(u => ({
      id:         u.id,
      username:   u.username,
      first_name: u.first_name,
      user_rank:  u.user_rank,
      reports:    buildTree(users, u.id)
    }));
}

// GET /api/overview/tree
router.get(
  '/tree',
  authenticateToken,
  async (req, res) => {
    try {
      const currentUserId = req.user.id;
      const [rows]        = await db.query(`
        SELECT id, username, first_name, user_rank, manager_id
        FROM users
      `);
      const tree = buildTree(rows, currentUserId);
      res.json(tree);
    } catch (err) {
      console.error('Error in /overview/tree:', err);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

module.exports = router;
