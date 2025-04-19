// backend/db.js
require('dotenv').config();
const mysql = require('mysql2');

const connection = mysql.createConnection({
  host     : process.env.MYSQL_HOST,
  user     : process.env.MYSQL_USER,
  password : process.env.MYSQL_PASSWORD,
  database : process.env.MYSQL_DATABASE
});

connection.connect(err => {
  if (err) console.error('Database connection error:', err);
  else     console.log('MySQL connected');
});

module.exports = connection;
