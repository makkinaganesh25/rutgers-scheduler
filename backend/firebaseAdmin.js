// backend/firebaseAdmin.js
const admin = require('firebase-admin');
const serviceAccount = require(
  process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH || './serviceAccountKey.json'
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

module.exports = admin;