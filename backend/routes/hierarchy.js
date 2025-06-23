// // backend/routes/hierarchy.js
// const express = require('express');
// const router  = express.Router();
// const db      = require('../db'); // your mysql2 pool/connection

// // 1) GET full tree
// router.get('/', async (req, res) => {
//   try {
//     const [rows] = await db.query(`
//       SELECT id, username, user_rank, manager_id
//       FROM users
//     `);

//     const map = {};
//     rows.forEach(u => {
//       map[u.id] = { 
//         id:        u.id,
//         username:  u.username,
//         user_rank: u.user_rank,
//         reports:   []
//       };
//     });

//     const tree = [];
//     rows.forEach(u => {
//       if (u.manager_id && map[u.manager_id]) {
//         map[u.manager_id].reports.push(map[u.id]);
//       } else {
//         tree.push(map[u.id]);
//       }
//     });

//     res.json(tree);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Failed to load hierarchy' });
//   }
// });

// // 2) POST create a new user/node
// //    body: { username, password, first_name?, user_rank, manager_id? }
// router.post('/', async (req, res) => {
//   const { username, password, first_name=null, user_rank, manager_id=null } = req.body;
//   try {
//     const [result] = await db.query(
//       `INSERT INTO users (username, password, first_name, user_rank, manager_id)
//        VALUES (?, ?, ?, ?, ?)`,
//       [username, password, first_name, user_rank, manager_id]
//     );
//     // Return the newly created node (without password)
//     const newNode = {
//       id:         result.insertId,
//       username,
//       user_rank,
//       reports:    []
//     };
//     res.status(201).json(newNode);
//   } catch (err) {
//     console.error(err);
//     res.status(400).json({ error: 'Could not create user' });
//   }
// });

// // 3) PATCH update an existing node’s rank or manager
// //    body: { first_name?, user_rank?, manager_id? }
// router.patch('/:id', async (req, res) => {
//   const { id } = req.params;
//   const fields = [];
//   const values = [];

//   ['first_name','user_rank','manager_id'].forEach(key => {
//     if (key in req.body) {
//       fields.push(`${key} = ?`);
//       values.push(req.body[key]);
//     }
//   });

//   if (!fields.length) {
//     return res.status(400).json({ error: 'No updatable fields provided' });
//   }

//   values.push(id);
//   try {
//     await db.query(
//       `UPDATE users
//        SET ${fields.join(', ')}
//        WHERE id = ?`,
//       values
//     );
//     res.json({ success: true });
//   } catch (err) {
//     console.error(err);
//     res.status(400).json({ error: 'Could not update user' });
//   }
// });

// // 4) DELETE a node (and orphan its reports)
// //    You could also cascade-delete or reassign; here we NULL out manager_id of children
// router.delete('/:id', async (req, res) => {
//   const { id } = req.params;
//   try {
//     // 1) Orphan any direct reports
//     await db.query(
//       `UPDATE users
//        SET manager_id = NULL
//        WHERE manager_id = ?`,
//       [id]
//     );
//     // 2) Remove the user
//     await db.query(
//       `DELETE FROM users
//        WHERE id = ?`,
//       [id]
//     );
//     res.json({ success: true });
//   } catch (err) {
//     console.error(err);
//     res.status(400).json({ error: 'Could not delete user' });
//   }
// });

// module.exports = router;

// backend/routes/hierarchy.js
const express = require('express');
const router  = express.Router();
const db      = require('../db'); // your mysql2 pool/connection

// 1) GET full tree (only active users)
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT id, username, user_rank, manager_id
      FROM users
      WHERE status = 'active'
    `);

    // build a map of id→node
    const map = {};
    rows.forEach(u => {
      map[u.id] = {
        id:        u.id,
        username:  u.username,
        user_rank: u.user_rank,
        reports:   []
      };
    });

    // assemble the tree, skipping any nodes whose manager is inactive or absent
    const tree = [];
    rows.forEach(u => {
      if (u.manager_id && map[u.manager_id]) {
        map[u.manager_id].reports.push(map[u.id]);
      } else {
        tree.push(map[u.id]);
      }
    });

    res.json(tree);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load hierarchy' });
  }
});

// 2) POST create a new user/node
router.post('/', async (req, res) => {
  const { username, password, first_name=null, user_rank, manager_id=null } = req.body;
  try {
    const [result] = await db.query(
      `INSERT INTO users (username, password, first_name, user_rank, manager_id)
       VALUES (?, ?, ?, ?, ?)`,
      [username, password, first_name, user_rank, manager_id]
    );
    const newNode = {
      id:         result.insertId,
      username,
      user_rank,
      reports:    []
    };
    res.status(201).json(newNode);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Could not create user' });
  }
});

// 3) PATCH update an existing node’s rank or manager (or status, if you want)
router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  const fields = [];
  const values = [];

  // you can now also allow updating status if desired:
  ['first_name','user_rank','manager_id','status'].forEach(key => {
    if (key in req.body) {
      fields.push(`${key} = ?`);
      values.push(req.body[key]);
    }
  });

  if (!fields.length) {
    return res.status(400).json({ error: 'No updatable fields provided' });
  }

  values.push(id);
  try {
    await db.query(
      `UPDATE users
       SET ${fields.join(', ')}
       WHERE id = ?`,
      values
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Could not update user' });
  }
});

// 4) DELETE a node (and orphan its reports)
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    // orphan direct reports
    await db.query(
      `UPDATE users
       SET manager_id = NULL
       WHERE manager_id = ?`,
      [id]
    );
    // delete the user
    await db.query(
      `DELETE FROM users
       WHERE id = ?`,
      [id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Could not delete user' });
  }
});

module.exports = router;
