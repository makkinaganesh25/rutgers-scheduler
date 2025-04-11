
// // require('dotenv').config();
// // const express = require('express');
// // const mysql = require('mysql2');
// // const path = require('path');
// // const { Storage } = require('@google-cloud/storage');
// // const cors = require('cors');
// // const bcrypt = require('bcrypt');
// // const findFreePort = require('find-free-port');

// // const app = express();
// // const PORT = 5500;

// // app.use(cors({
// //   origin: 'http://localhost:3000', // Replace with the correct frontend URL if different
// //   credentials: true // If you need to handle cookies or HTTP authentication
// // }));

// // // Initialize Google Cloud Storage
// // const storage = new Storage({
// //     keyFilename: path.join(__dirname, './shift-scheduler-project-d2178dba5fdb.json'),
// // });
// // const bucketName = 'sakai_files';
// // const bucket = storage.bucket(bucketName);

// // // MySQL connection
// // const db = mysql.createConnection({
// //   host: process.env.MYSQL_HOST,
// //   user: process.env.MYSQL_USER,
// //   password: process.env.MYSQL_PASSWORD,
// //   database: process.env.MYSQL_DATABASE,
// // });

// // db.connect((err) => {
// //   if (err) {
// //     console.error('Database connection error:', err);
// //     return;
// //   }
// //   console.log('MySQL connected');
// // });

// // // Middleware
// // app.use(express.json());

// // // Test Route
// // app.get('/', (req, res) => {
// //   res.send('Shift Scheduler API');
// // });



// // async function listFilesAndFolders(prefix = '') {
// //   try {
// //     // Retrieve files and folders in the current prefix
// //     const [files] = await bucket.getFiles({ prefix, delimiter: '/' });
// //     const items = { files: [], folders: {} };

// //     // Process files in the current folder
// //     items.files = files
// //       .filter((file) => !file.name.endsWith('/'))
// //       .map((file) => ({
// //         name: file.name.split('/').pop(),
// //         url: `https://storage.googleapis.com/${bucketName}/${file.name}`,
// //       }));

// //     // Retrieve folders in the current prefix
// //     const [folderFiles, , apiResponse] = await bucket.getFiles({ prefix, delimiter: '/' });
// //     const folderPrefixes = apiResponse.prefixes || [];

// //     // Process subfolders recursively
// //     for (const folderPrefix of folderPrefixes) {
// //       const folderName = folderPrefix.slice(prefix.length).replace(/\/$/, '');
// //       items.folders[folderName] = await listFilesAndFolders(folderPrefix);
// //     }

// //     return items;
// //   } catch (error) {
// //     console.error('Error in listFilesAndFolders function:', error);
// //     throw new Error('Error fetching files and folders');
// //   }
// // }

// // // API endpoint to retrieve files and folders
// // app.get('/api/media-files', async (req, res) => {
// //   try {
// //     const data = await listFilesAndFolders('Sakai Files/');
// //     res.json(data);
// //   } catch (error) {
// //     console.error('Error fetching media files:', error);
// //     res.status(500).json({ error: 'Failed to fetch media files' });
// //   }
// // });

// // // MySQL User endpoints
// // app.get('/users', (req, res) => {
// //   const query = 'SELECT * FROM users';
// //   db.query(query, (err, results) => {
// //     if (err) {
// //       console.error('Error fetching users:', err);
// //       res.status(500).send('Server error');
// //       return;
// //     }
// //     res.json(results);
// //   });
// // });

// // // Endpoint to create a new shift
// // app.post('/shifts', (req, res) => {
// //   const { date, start_time, end_time, assigned_user_id } = req.body;

// //   const query = 'INSERT INTO shifts (date, start_time, end_time, assigned_user_id) VALUES (?, ?, ?, ?)';
// //   db.query(query, [date, start_time, end_time, assigned_user_id], (err, result) => {
// //     if (err) {
// //       console.error('Error creating shift:', err);
// //       res.status(500).send('Server error');
// //       return;
// //     }
// //     res.json({ message: 'Shift created successfully', shiftId: result.insertId });
// //   });
// // });

// // // Endpoint to get all shifts
// // app.get('/shifts', (req, res) => {
// //   const query = 'SELECT * FROM shifts';
// //   db.query(query, (err, results) => {
// //     if (err) {
// //       console.error('Error fetching shifts:', err);
// //       res.status(500).send('Server error');
// //       return;
// //     }
// //     res.json(results);
// //   });
// // });

// // // Endpoint to create a coverage request with conflict checking
// // app.post('/coverage-requests', (req, res) => {
// //   const { shift_id, requesting_user_id } = req.body;

// //   const acceptedCheckQuery = 'SELECT * FROM coverage_requests WHERE shift_id = ? AND status = "accepted"';
// //   db.query(acceptedCheckQuery, [shift_id], (err, acceptedResults) => {
// //     if (err) {
// //       console.error('Error checking for accepted requests:', err);
// //       res.status(500).send('Server error');
// //       return;
// //     }

// //     if (acceptedResults.length > 0) {
// //       res.json({
// //         message: 'This shift is already assigned to another user.',
// //         assigned: true
// //       });
// //       return;
// //     }

// //     const existingRequestQuery = 'SELECT * FROM coverage_requests WHERE shift_id = ? AND requesting_user_id = ?';
// //     db.query(existingRequestQuery, [shift_id, requesting_user_id], (err, existingRequestResults) => {
// //       if (err) {
// //         console.error('Error checking for existing coverage request:', err);
// //         res.status(500).send('Server error');
// //         return;
// //       }

// //       if (existingRequestResults.length > 0) {
// //         res.json({
// //           message: 'A coverage request for this shift by this user already exists.',
// //           duplicate: true
// //         });
// //         return;
// //       }

// //       const shiftQuery = 'SELECT * FROM shifts WHERE id = ?';
// //       db.query(shiftQuery, [shift_id], (err, shiftResults) => {
// //         if (err) {
// //           console.error('Error fetching shift:', err);
// //           res.status(500).send('Server error');
// //           return;
// //         }

// //         if (shiftResults.length === 0) {
// //           res.status(400).json({ message: 'Shift not found' });
// //           return;
// //         }

// //         const shift = shiftResults[0];
// //         const conflictQuery = `
// //           SELECT * FROM shifts 
// //           WHERE assigned_user_id = ? 
// //           AND date = ? 
// //           AND id != ?  
// //           AND (
// //             (start_time < ? AND end_time > ?) OR
// //             (start_time < ? AND end_time > ?)
// //           )
// //         `;
// //         db.query(conflictQuery, [requesting_user_id, shift.date, shift.id, shift.end_time, shift.start_time, shift.start_time, shift.end_time], (err, conflictResults) => {
// //           if (err) {
// //             console.error('Error checking for conflicts:', err);
// //             res.status(500).send('Server error');
// //             return;
// //           }

// //           if (conflictResults.length > 0) {
// //             const insertQueueQuery = 'INSERT INTO coverage_requests (shift_id, requesting_user_id, status, created_at) VALUES (?, ?, "queued", CURRENT_TIMESTAMP)';
// //             db.query(insertQueueQuery, [shift_id, requesting_user_id], (err, result) => {
// //               if (err) {
// //                 console.error('Error adding request to queue:', err);
// //                 res.status(500).send('Server error');
// //                 return;
// //               }
// //               res.json({
// //                 message: 'Schedule conflict detected. Request added to queue for review.',
// //                 conflict: true,
// //                 queueId: result.insertId
// //               });
// //             });
// //           } else {
// //             const insertQuery = 'INSERT INTO coverage_requests (shift_id, requesting_user_id, status) VALUES (?, ?, "accepted")';
// //             db.query(insertQuery, [shift_id, requesting_user_id], (err, result) => {
// //               if (err) {
// //                 console.error('Error accepting coverage request:', err);
// //                 res.status(500).send('Server error');
// //                 return;
// //               }
// //               res.json({
// //                 message: 'Coverage request accepted automatically',
// //                 requestId: result.insertId
// //               });
// //             });
// //           }
// //         });
// //       });
// //     });
// //   });
// // });

// // // Register a new user
// // app.post('/register', async (req, res) => {
// //   const { username, password } = req.body;
// //   const hashedPassword = await bcrypt.hash(password, 10);

// //   const query = 'INSERT INTO users (username, password) VALUES (?, ?)';
// //   db.query(query, [username, hashedPassword], (err, result) => {
// //     if (err) {
// //       console.error('Error registering user:', err);
// //       res.status(500).send('Server error');
// //       return;
// //     }
// //     res.json({ message: 'User registered successfully', userId: result.insertId });
// //   });
// // });

// // // Login endpoint
// // app.post('/login', async (req, res) => {
// //   const { username, password } = req.body;
// //   const query = 'SELECT * FROM users WHERE username = ?';
// //   db.query(query, [username], async (err, results) => {
// //     if (err) {
// //       res.status(500).json({ success: false, message: 'Server error while fetching user' });
// //       return;
// //     }
// //     if (results.length === 0) {
// //       res.status(400).json({ success: false, message: 'Invalid username or password' });
// //       return;
// //     }
// //     const user = results[0];
// //     try {
// //       const isMatch = await bcrypt.compare(password, user.password);
// //       if (isMatch) {
// //         res.json({ success: true, message: 'Login successful' });
// //       } else {
// //         res.status(400).json({ success: false, message: 'Invalid username or password' });
// //       }
// //     } catch (compareError) {
// //       res.status(500).json({ success: false, message: 'Error during password comparison' });
// //     }
// //   });
// // });

// // // Start server
// // findFreePort(PORT, (err, freePort) => {
// //   if (err) {
// //     console.error('Error finding free port:', err);
// //     return;
// //   }

// //   if (freePort !== PORT) {
// //     console.log(`Port ${PORT} is already in use. Using available port ${freePort} instead.`);
// //   }

// //   const server = app.listen(freePort, () => {
// //     console.log(`Server is running on http://localhost:${freePort}`);
// //   });

// //   server.on('error', (err) => {
// //     if (err.code === 'EADDRINUSE') {
// //       console.error(`Port ${freePort} is already in use. Please use a different port.`);
// //       process.exit(1);
// //     } else {
// //       throw err;
// //     }
// //   });

// //   // Gracefully handle shutdown
// //   process.on('SIGINT', () => {
// //     server.close(() => {
// //       console.log('Server closed gracefully.');
// //       process.exit(0);
// //     });
// //   });
// // });



// require('dotenv').config();
// const express = require('express');
// const mysql = require('mysql2');
// const path = require('path');
// const { Storage } = require('@google-cloud/storage');
// const cors = require('cors');
// const bcrypt = require('bcrypt');
// const findFreePort = require('find-free-port');
// const { google } = require('googleapis');
// const fs = require('fs');

// const app = express();
// const PORT = 5500;

// // Middleware
// app.use(cors({
//   origin: 'http://localhost:3000', // Replace with your frontend's URL if deployed
//   credentials: true
// }));
// app.use(express.json());

// // Initialize Google Cloud Storage
// const storage = new Storage({
//   keyFilename: path.join(__dirname, './shift-scheduler-project-d2178dba5fdb.json'),
// });
// const bucketName = 'sakai_files';
// const bucket = storage.bucket(bucketName);

// // MySQL connection
// const db = mysql.createConnection({
//   host: process.env.MYSQL_HOST,
//   user: process.env.MYSQL_USER,
//   password: process.env.MYSQL_PASSWORD,
//   database: process.env.MYSQL_DATABASE,
// });

// db.connect((err) => {
//   if (err) {
//     console.error('Database connection error:', err);
//     return;
//   }
//   console.log('MySQL connected');
// });

// // Dialogflow Agent Integration
// const serviceAccount = JSON.parse(
//   fs.readFileSync('./shift-scheduler-project-d2178dba5fdb.json', 'utf8')
// );

// const client = new google.auth.JWT(
//   serviceAccount.client_email,
//   null,
//   serviceAccount.private_key,
//   ['https://www.googleapis.com/auth/dialogflow']
// );

// const projectId = 'shift-scheduler-project';
// const locationId = 'us-central1';
// const agentId = 'cso-chatbot-queries-v1';

// // Chatbot endpoint
// const sessions = {};
// app.post('/api/ask', async (req, res) => {
//   const userId = req.body.userId || 'default-user';
//   const query = req.body.query;

//   if (!query) {
//       return res.status(400).json({ error: 'Query is required' });
//   }

//   // Ensure Google Cloud client is set up correctly
//   try {
//       const dialogflow = google.dialogflow({
//           version: 'v3',
//           auth: client,
//       });

//       const sessionId = `session-${userId}`;
//       const request = {
//           session: `projects/${projectId}/locations/${locationId}/agents/${agentId}/sessions/${sessionId}`,
//           queryInput: {
//               text: {
//                   text: query,
//                   languageCode: 'en-US',
//               },
//           },
//       };

//       const response = await dialogflow.projects.locations.agents.sessions.detectIntent(request);
//       const result = response.data.queryResult;

//       res.json({
//           response: result.fulfillmentText,
//           context: result.outputContexts,
//       });
//   } catch (error) {
//       console.error('Error communicating with chatbot API:', error);
//       res.status(500).json({ error: 'Failed to communicate with chatbot API' });
//   }
// });


// app.get('/', (req, res) => {
//   res.send('Welcome to the Shift Scheduler API! The server is running.');
// });

// // Serve GCP Search Widget Token
// app.get('/api/auth-token', async (req, res) => {
//   try {
//     const token = await client.authorize();
//     res.json({ authToken: token.access_token });
//   } catch (error) {
//     console.error('Error generating auth token:', error);
//     res.status(500).json({ error: 'Failed to generate auth token' });
//   }
// });

// // Recursive function to list files and folders in Google Cloud Storage
// async function listFilesAndFolders(prefix = '') {
//   try {
//     const [files] = await bucket.getFiles({ prefix, delimiter: '/' });
//     const items = { files: [], folders: {} };

//     items.files = files
//       .filter((file) => !file.name.endsWith('/'))
//       .map((file) => ({
//         name: file.name.split('/').pop(),
//         url: `https://storage.googleapis.com/${bucketName}/${file.name}`,
//       }));

//     const [folderFiles, , apiResponse] = await bucket.getFiles({ prefix, delimiter: '/' });
//     const folderPrefixes = apiResponse.prefixes || [];

//     for (const folderPrefix of folderPrefixes) {
//       const folderName = folderPrefix.slice(prefix.length).replace(/\/$/, '');
//       items.folders[folderName] = await listFilesAndFolders(folderPrefix);
//     }

//     return items;
//   } catch (error) {
//     console.error('Error in listFilesAndFolders function:', error);
//     throw new Error('Error fetching files and folders');
//   }
// }

// // API endpoint to retrieve files and folders
// app.get('/api/media-files', async (req, res) => {
//   try {
//     const data = await listFilesAndFolders('Sakai Files/');
//     res.json(data);
//   } catch (error) {
//     console.error('Error fetching media files:', error);
//     res.status(500).json({ error: 'Failed to fetch media files' });
//   }
// });

// // MySQL User Endpoints
// app.get('/users', (req, res) => {
//   const query = 'SELECT * FROM users';
//   db.query(query, (err, results) => {
//     if (err) {
//       console.error('Error fetching users:', err);
//       res.status(500).send('Server error');
//       return;
//     }
//     res.json(results);
//   });
// });

// app.post('/register', async (req, res) => {
//   const { username, password } = req.body;
//   const hashedPassword = await bcrypt.hash(password, 10);

//   const query = 'INSERT INTO users (username, password) VALUES (?, ?)';
//   db.query(query, [username, hashedPassword], (err, result) => {
//     if (err) {
//       console.error('Error registering user:', err);
//       res.status(500).send('Server error');
//       return;
//     }
//     res.json({ message: 'User registered successfully', userId: result.insertId });
//   });
// });

// app.post('/login', async (req, res) => {
//   const { username, password } = req.body;
//   const query = 'SELECT * FROM users WHERE username = ?';
//   db.query(query, [username], async (err, results) => {
//     if (err) {
//       res.status(500).json({ success: false, message: 'Server error while fetching user' });
//       return;
//     }
//     if (results.length === 0) {
//       res.status(400).json({ success: false, message: 'Invalid username or password' });
//       return;
//     }
//     const user = results[0];
//     try {
//       const isMatch = await bcrypt.compare(password, user.password);
//       if (isMatch) {
//         res.json({ success: true, message: 'Login successful' });
//       } else {
//         res.status(400).json({ success: false, message: 'Invalid username or password' });
//       }
//     } catch (compareError) {
//       res.status(500).json({ success: false, message: 'Error during password comparison' });
//     }
//   });
// });

// // Shift Management Endpoints
// app.get('/shifts', (req, res) => {
//   const query = 'SELECT * FROM shifts';
//   db.query(query, (err, results) => {
//     if (err) {
//       console.error('Error fetching shifts:', err);
//       res.status(500).send('Server error');
//       return;
//     }
//     res.json(results);
//   });
// });

// app.post('/shifts', (req, res) => {
//   const { date, start_time, end_time, assigned_user_id } = req.body;

//   const query = 'INSERT INTO shifts (date, start_time, end_time, assigned_user_id) VALUES (?, ?, ?, ?)';
//   db.query(query, [date, start_time, end_time, assigned_user_id], (err, result) => {
//     if (err) {
//       console.error('Error creating shift:', err);
//       res.status(500).send('Server error');
//       return;
//     }
//     res.json({ message: 'Shift created successfully', shiftId: result.insertId });
//   });
// });

// // Coverage Request Endpoint
// app.post('/coverage-requests', (req, res) => {
//   const { shift_id, requesting_user_id } = req.body;

//   const acceptedCheckQuery = 'SELECT * FROM coverage_requests WHERE shift_id = ? AND status = "accepted"';
//   db.query(acceptedCheckQuery, [shift_id], (err, acceptedResults) => {
//     if (err) {
//       console.error('Error checking for accepted requests:', err);
//       res.status(500).send('Server error');
//       return;
//     }

//     if (acceptedResults.length > 0) {
//       res.json({
//         message: 'This shift is already assigned to another user.',
//         assigned: true
//       });
//       return;
//     }

//     const insertQuery = 'INSERT INTO coverage_requests (shift_id, requesting_user_id, status) VALUES (?, ?, "accepted")';
//     db.query(insertQuery, [shift_id, requesting_user_id], (err, result) => {
//       if (err) {
//         console.error('Error accepting coverage request:', err);
//         res.status(500).send('Server error');
//         return;
//       }
//       res.json({
//         message: 'Coverage request accepted automatically',
//         requestId: result.insertId
//       });
//     });
//   });
// });

// // Start server
// findFreePort(PORT, (err, freePort) => {
//   if (err) {
//     console.error('Error finding free port:', err);
//     return;
//   }

//   const server = app.listen(freePort, () => {
//     console.log(`Server is running on http://localhost:${freePort}`);
//   });

//   process.on('SIGINT', () => {
//     server.close(() => {
//       console.log('Server closed gracefully.');
//       process.exit(0);
//     });
//   });
// });



require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const path = require('path');
const { Storage } = require('@google-cloud/storage');
const cors = require('cors');
const bcrypt = require('bcrypt');
const findFreePort = require('find-free-port');
const { SearchServiceClient } = require('@google-cloud/discoveryengine');
const fs = require('fs'); //  Make sure you have the fs module imported

const app = express();
const PORT = 5500;

// Middleware
app.use(cors({
    origin: 'http://localhost:3000', // Replace with your frontend's URL if deployed
    credentials: true
}));
app.use(express.json());

// Initialize Google Cloud Storage
const storage = new Storage({
    keyFilename: path.join(__dirname, './shift-scheduler-project-d2178dba5fdb.json'), // Update with your key file
});
const bucketName = 'sakai_files'; // Your bucket name
const bucket = storage.bucket(bucketName);

// Initialize Google Cloud Search Client
const searchClient = new SearchServiceClient({
    keyFilename: path.join(__dirname, './shift-scheduler-project-d2178dba5fdb.json'), // Update with your key file
});

// MySQL connection (Ensure your .env file has the correct credentials)
const db = mysql.createConnection({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  authPlugins: {
      mysql_clear_password: () => () => Buffer.from(process.env.MYSQL_PASSWORD + '\0')
  }
});


db.connect((err) => {
    if (err) {
        console.error('Database connection error:', err);
        return;
    }
    console.log('MySQL connected');
});

// Vertex AI Search Integration
const projectId = 'shift-scheduler-project'; // Your Project ID
const location = 'global'; // Your Search App Location
const collectionId = 'default_collection';
const searchEngineId = 'cso-chatbot-queries-v1_1703993260678'; // Your Search Engine ID
const servingConfigId = 'default_config';

// Search endpoint
app.post('/api/ask', async (req, res) => {
    const query = req.body.query;

    if (!query) {
        return res.status(400).json({ error: 'Query is required' });
    }

    try {
        const parent = `projects/${projectId}/locations/${location}/collections/${collectionId}/dataStores/${searchEngineId}/servingConfigs/${servingConfigId}`;
        const request = {
            parent,
            query,
            pageSize: 5, // Adjust as needed
            // You can add more options like offset, filter, orderBy here
        };

        const [searchResponse] = await searchClient.search(request);

        // Process and format the response
        const formattedResponses = searchResponse.results.map(result => ({
            title: result.document.structData.title,
            // Assuming your data store has a 'content' field for the main text
            snippet: result.document.structData.content,
            link: result.document.structData.link, // If applicable
        }));

        res.json({ responses: formattedResponses });
    } catch (error) {
        console.error('Error during search:', error);
        res.status(500).json({ error: 'Failed to perform search' });
    }
});

// ... rest of your existing code ...


app.get('/', (req, res) => {
  res.send('Welcome to the Shift Scheduler API! The server is running.');
});

// Serve GCP Search Widget Token
app.get('/api/auth-token', async (req, res) => {
  try {
    const token = await client.authorize();
    res.json({ authToken: token.access_token });
  } catch (error) {
    console.error('Error generating auth token:', error);
    res.status(500).json({ error: 'Failed to generate auth token' });
  }
});

// Recursive function to list files and folders in Google Cloud Storage
async function listFilesAndFolders(prefix = '') {
  try {
    const [files] = await bucket.getFiles({ prefix, delimiter: '/' });
    const items = { files: [], folders: {} };

    items.files = files
      .filter((file) => !file.name.endsWith('/'))
      .map((file) => ({
        name: file.name.split('/').pop(),
        url: `https://storage.googleapis.com/${bucketName}/${file.name}`,
      }));

    const [folderFiles, , apiResponse] = await bucket.getFiles({ prefix, delimiter: '/' });
    const folderPrefixes = apiResponse.prefixes || [];

    for (const folderPrefix of folderPrefixes) {
      const folderName = folderPrefix.slice(prefix.length).replace(/\/$/, '');
      items.folders[folderName] = await listFilesAndFolders(folderPrefix);
    }

    return items;
  } catch (error) {
    console.error('Error in listFilesAndFolders function:', error);
    throw new Error('Error fetching files and folders');
  }
}

// API endpoint to retrieve files and folders
app.get('/api/media-files', async (req, res) => {
  try {
    const data = await listFilesAndFolders('Sakai Files/');
    res.json(data);
  } catch (error) {
    console.error('Error fetching media files:', error);
    res.status(500).json({ error: 'Failed to fetch media files' });
  }
});

// MySQL User Endpoints
app.get('/users', (req, res) => {
  const query = 'SELECT * FROM users';
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching users:', err);
      res.status(500).send('Server error');
      return;
    }
    res.json(results);
  });
});

app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  const query = 'INSERT INTO users (username, password) VALUES (?, ?)';
  db.query(query, [username, hashedPassword], (err, result) => {
    if (err) {
      console.error('Error registering user:', err);
      res.status(500).send('Server error');
      return;
    }
    res.json({ message: 'User registered successfully', userId: result.insertId });
  });
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const query = 'SELECT * FROM users WHERE username = ?';
  db.query(query, [username], async (err, results) => {
    if (err) {
      res.status(500).json({ success: false, message: 'Server error while fetching user' });
      return;
    }
    if (results.length === 0) {
      res.status(400).json({ success: false, message: 'Invalid username or password' });
      return;
    }
    const user = results[0];
    try {
      const isMatch = await bcrypt.compare(password, user.password);
      if (isMatch) {
        res.json({ success: true, message: 'Login successful' });
      } else {
        res.status(400).json({ success: false, message: 'Invalid username or password' });
      }
    } catch (compareError) {
      res.status(500).json({ success: false, message: 'Error during password comparison' });
    }
  });
});

// Shift Management Endpoints
app.get('/shifts', (req, res) => {
  const query = 'SELECT * FROM shifts';
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching shifts:', err);
      res.status(500).send('Server error');
      return;
    }
    res.json(results);
  });
});

app.post('/shifts', (req, res) => {
  const { date, start_time, end_time, assigned_user_id } = req.body;

  const query = 'INSERT INTO shifts (date, start_time, end_time, assigned_user_id) VALUES (?, ?, ?, ?)';
  db.query(query, [date, start_time, end_time, assigned_user_id], (err, result) => {
    if (err) {
      console.error('Error creating shift:', err);
      res.status(500).send('Server error');
      return;
    }
    res.json({ message: 'Shift created successfully', shiftId: result.insertId });
  });
});

// Coverage Request Endpoint
app.post('/coverage-requests', (req, res) => {
  const { shift_id, requesting_user_id } = req.body;

  const acceptedCheckQuery = 'SELECT * FROM coverage_requests WHERE shift_id = ? AND status = "accepted"';
  db.query(acceptedCheckQuery, [shift_id], (err, acceptedResults) => {
    if (err) {
      console.error('Error checking for accepted requests:', err);
      res.status(500).send('Server error');
      return;
    }

    if (acceptedResults.length > 0) {
      res.json({
        message: 'This shift is already assigned to another user.',
        assigned: true
      });
      return;
    }

    const insertQuery = 'INSERT INTO coverage_requests (shift_id, requesting_user_id, status) VALUES (?, ?, "accepted")';
    db.query(insertQuery, [shift_id, requesting_user_id], (err, result) => {
      if (err) {
        console.error('Error accepting coverage request:', err);
        res.status(500).send('Server error');
        return;
      }
      res.json({
        message: 'Coverage request accepted automatically',
        requestId: result.insertId
      });
    });
  });
});

// Start server
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