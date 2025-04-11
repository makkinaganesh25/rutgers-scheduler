// db.js
require('dotenv').config();
const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  // Uncomment the authPlugins block if needed:
  // authPlugins: { mysql_clear_password: () => () => Buffer.from(process.env.MYSQL_PASSWORD + '\0') }
});

connection.connect((err) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('MySQL connected');
  }
});

module.exports = connection;
// db.js
// require('dotenv').config();
// const mysql = require('mysql2');