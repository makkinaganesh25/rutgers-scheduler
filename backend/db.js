// File: backend/db.js
require('dotenv').config();

// 1) import mysql2 (callback API)
const mysql = require('mysql2');

// 2) create your pool as before
const pool = mysql.createPool({
  host:               process.env.MYSQL_HOST,
  user:               process.env.MYSQL_USER,
  password:           process.env.MYSQL_PASSWORD,
  database:           process.env.MYSQL_DATABASE,
  waitForConnections: true,
  connectionLimit:    10,
  queueLimit:         0
});

// 3) wrap it once in the promise‐API and export that
const db = pool.promise();

// quick test connection on startup
db.getConnection()
  .then(conn => {
    console.log('✅ MySQL promise-pool connected');
    conn.release();
  })
  .catch(err => {
    console.error('MySQL connection error:', err);
  });

module.exports = db;
