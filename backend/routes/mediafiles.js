const express = require('express');
const { Storage } = require('@google-cloud/storage');
const path = require('path');

const router = express.Router();

// Initialize Google Cloud Storage
const storage = new Storage({
  keyFilename: path.join(__dirname, '../shift-scheduler-project-d2178dba5fdb.json'),
});
const bucketName = 'sakai_files';
const bucket = storage.bucket(bucketName);

async function listFilesAndFolders(prefix = '') {
  // Fetch files & “directories” under this prefix
  const [files] = await bucket.getFiles({ prefix, delimiter: '/' });
  const items = { files: [], folders: {} };

  // 1) Files at this level
  items.files = files
    .filter(f => !f.name.endsWith('/'))
    .map(f => ({
      name: f.name.split('/').pop(),
      url: `https://storage.googleapis.com/${bucketName}/${f.name}`,
    }));

  // 2) Sub‑folders at this level
  const [ , , apiResponse] = await bucket.getFiles({ prefix, delimiter: '/' });
  const prefixes = apiResponse.prefixes || [];
  for (const folderPrefix of prefixes) {
    const folderName = folderPrefix.slice(prefix.length).replace(/\/$/, '');
    // Recursively list that folder’s contents
    items.folders[folderName] = await listFilesAndFolders(folderPrefix);
  }

  return items;
}

router.get('/', async (req, res) => {
  try {
    // list everything at the bucket root
    const data = await listFilesAndFolders('');
    return res.json(data);
  } catch (error) {
    console.error('Error fetching media files:', error);
    return res.status(500).json({ error: 'Failed to fetch media files' });
  }
});

module.exports = router;
