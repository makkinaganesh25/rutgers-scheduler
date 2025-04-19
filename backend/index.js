// backend/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const findFreePort = require('find-free-port');

const app = express();
const PORT = process.env.PORT || 5500;

// Middleware: enable CORS for your React frontend & parse JSON requests
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());

// Import and mount routes
const usersRouter = require('./routes/users');
const shiftsRouter = require('./routes/shifts');

app.use('/api/users', usersRouter);   // Users registration & login endpoints
app.use('/api/shifts', shiftsRouter);   // Shifts & coverage endpoints

// Health check endpoint
app.get('/', (req, res) => {
  res.send('Welcome to the Shift Scheduler API! The server is running.');
});

// Start server using findFreePort (to automatically pick a free port)
findFreePort(PORT, (err, freePort) => {
  if (err) {
    console.error('Error finding free port:', err);
    return;
  }
  const server = app.listen(freePort, () => {
    console.log(`Server is running on http://localhost:${freePort}`);
  });
  
  process.on('SIGINT', () => {
    server.close(() => {
      console.log('Server closed gracefully.');
      process.exit(0);
    });
  });
});
