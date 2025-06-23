// scripts/seedManagerId.js
const mysql = require('mysql2/promise');
const map   = require('../manager-map.json');
require('dotenv').config();

async function main() {
  const conn = await mysql.createConnection({
    host     : process.env.DB_HOST     || 'localhost',
    user     : process.env.DB_USER     || 'root',
    password : process.env.DB_PASS     || '',
    database : process.env.DB_NAME     || 'shift_scheduler'
  });

  console.log('Connected to MySQL; seeding manager_id...');

  for (const [managerName, subordinates] of Object.entries(map)) {
    // Fetch manager's numeric id
    const [rowsM] = await conn.execute(
      'SELECT id FROM users WHERE username = ?',
      [managerName]
    );
    if (!rowsM.length) {
      console.warn(`⚠️  Manager not found: ${managerName}`);
      continue;
    }
    const managerId = rowsM[0].id;

    // Update each subordinate
    for (const subName of subordinates) {
      const [rowsS] = await conn.execute(
        'UPDATE users SET manager_id = ? WHERE username = ?',
        [managerId, subName]
      );
      if (rowsS.affectedRows === 0) {
        console.warn(`  ⚠️  Subordinate not found: ${subName}`);
      } else {
        console.log(`  Set ${subName}.manager_id = ${managerId}`);
      }
    }
  }

  console.log('Done seeding manager_id.');
  await conn.end();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
