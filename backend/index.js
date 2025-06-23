// // backend/index.js
// require('dotenv').config();
// const express = require('express');
// const cors    = require('cors');
// const app     = express();
// const PORT    = process.env.PORT ? +process.env.PORT : 5001;

// app.use(cors());
// app.use(express.json());

// // your other routers…
// app.use('/api/calendar',    require('./routes/calendar'));
// app.use('/api/users',       require('./routes/users'));
// app.use('/api/shifts',      require('./routes/shifts'));
// app.use('/api/chat',        require('./routes/chat'));
// app.use('/api/media-files', require('./routes/mediafiles'));
// app.use('/api/overview',    require('./routes/overview'));
// app.use('/api/sheet-sync',  require('./routes/sheetSync'));

// // **only one mount** for all events & slots endpoints
// app.use('/api/events', require('./routes/events'));

// app.get('/', (_,res) => res.send('Shift Scheduler API up.'));
// app.listen(PORT, () => {
//   console.log(`API listening on http://localhost:${PORT}`);
// });

// require('dotenv').config();
// const express               = require('express');
// const cors                  = require('cors');
// const hierarchyRoutes       = require('./routes/hierarchy');
// const securityLeaveRouter    = require('./routes/securityLeave');
// const announcementsRouter   = require('./routes/announcements');
// const securityMandatesRouter = require('./routes/securityMandates');
// const csoLeaveRouter         = require('./routes/csoLeave');
// const csoMandatesRouter      = require('./routes/csoMandates');

// const app = express();
// const PORT = process.env.PORT ? +process.env.PORT : 5001;

// // 1) CORS + JSON parsing
// app.use(cors());
// app.use(express.json());

// // 2) Feature routers
// app.use('/api/calendar',       require('./routes/calendar'));
// app.use('/api/users',          require('./routes/users'));
// app.use('/api/admin/users',    require('./routes/adminUsers'));
// app.use('/api/shifts',         require('./routes/shifts'));
// app.use('/api/chat',           require('./routes/chat'));
// app.use('/api/media-files',    require('./routes/mediafiles'));
// app.use('/api/overview',       require('./routes/overview'));
// app.use('/api/sheet-sync',     require('./routes/sheetSync'));
// app.use('/api/hierarchy',      hierarchyRoutes);

// // Security leave + mandates
// app.use('/api/security/leave',   securityLeaveRouter);
// app.use('/api/security/mandates',securityMandatesRouter);

// // CSO leave + mandates
// app.use('/api/cso/leave',        csoLeaveRouter);
// // app.use('/api/cso/mandates',     csoMandatesRouter);
// app.use('/api/cso/mandates', require('./routes/csoMandates'));


// // 3) Special-events & slots
// app.use(
//   '/api/events/:id/slots',
//   require('./routes/eventSlots')
// );
// app.use(
//   '/api/events',
//   require('./routes/events')
// );

// // 4) Health-check
// app.get('/', (_, res) => res.send('Shift Scheduler API up.'));

// // 5) Start server
// app.listen(PORT, () => {
//   console.log(`API listening on http://localhost:${PORT}`);
// });

//------------------------------------------------------------------------------------------------

require('dotenv').config();
const express                 = require('express');
const cors                    = require('cors');

const hierarchyRoutes         = require('./routes/hierarchy');
const securityLeaveRouter     = require('./routes/securityLeave');
const securityMandatesRouter  = require('./routes/securityMandates');
const csoLeaveRouter          = require('./routes/csoLeave');
const csoMandatesRouter       = require('./routes/csoMandates');
const announcementsRouter     = require('./routes/announcements');
const sheetSyncRouter = require('./routes/sheetSync');

const app = express();
const PORT = process.env.PORT ? +process.env.PORT : 5001;

// 1) CORS + JSON parsing
app.use(cors());
app.use(express.json());

// 2) Feature routers
app.use('/api/calendar',       require('./routes/calendar'));
app.use('/api/users',          require('./routes/users'));
app.use('/api/admin/users',    require('./routes/adminUsers'));
app.use('/api/shifts',         require('./routes/shifts'));
app.use('/api/chat',           require('./routes/chat'));
app.use('/api/media-files',    require('./routes/mediafiles'));
app.use('/api/overview',       require('./routes/overview'));
app.use('/api/sheet-sync',     require('./routes/sheetSync'));
app.use('/api/hierarchy',      hierarchyRoutes);

// Security leave + mandates
app.use('/api/security/leave',   securityLeaveRouter);
app.use('/api/security/mandates',securityMandatesRouter);

// CSO leave + mandates
app.use('/api/cso/leave',        csoLeaveRouter);
app.use('/api/cso/mandates',     csoMandatesRouter);

// Special-events & slots
app.use('/api/events/:id/slots', require('./routes/eventSlots'));
app.use('/api/events',           require('./routes/events'));

// Announcements feature
app.use('/api/announcements', announcementsRouter);

//
app.use('/api/sheet-sync', sheetSyncRouter);

// 4) Health-check
app.get('/', (_, res) => res.send('Shift Scheduler API up.'));

// 5) Start server
app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});

// //-------------------------------------------------------------------------------------------------
// require('dotenv').config();
// const express               = require('express');
// const cors                  = require('cors');
// const hierarchyRoutes       = require('./routes/hierarchy');
// const securityLeaveRouter   = require('./routes/securityLeave');
// const securityMandatesRouter= require('./routes/securityMandates');
// const csoLeaveRouter        = require('./routes/csoLeave');
// const csoMandatesRouter     = require('./routes/csoMandates');
// const announcementsRouter   = require('./routes/announcements');
// const firebaseAuthRouter = require('./routes/firebaseAuth');
// const sheetSyncRouter       = require('./routes/sheetSync');
// const app = express();
// const PORT = +process.env.PORT || 5001;

// app.use(cors());
// app.use(express.json());

// app.use('/api/calendar',     require('./routes/calendar'));
// app.use('/api/users',        require('./routes/users'));
// app.use('/api/admin/users',  require('./routes/adminUsers'));
// app.use('/api/firebase', firebaseAuthRouter);
// app.use('/api/shifts',       require('./routes/shifts'));
// app.use('/api/chat',         require('./routes/chat'));
// app.use('/api/media-files',  require('./routes/mediafiles'));
// app.use('/api/overview',     require('./routes/overview'));
// app.use('/api/sheet-sync',   sheetSyncRouter);
// app.use('/api/hierarchy',    hierarchyRoutes);
// app.use('/api/security/leave',    securityLeaveRouter);
// app.use('/api/security/mandates', securityMandatesRouter);
// app.use('/api/cso/leave',         csoLeaveRouter);
// app.use('/api/cso/mandates',      csoMandatesRouter);
// app.use('/api/events/:id/slots',  require('./routes/eventSlots'));
// app.use('/api/events',            require('./routes/events'));
// app.use('/api/announcements',     announcementsRouter);

// app.get('/', (_,res) => res.send('Shift Scheduler API up.'));
// app.listen(PORT, () => console.log(`API listening on http://localhost:${PORT}`));
