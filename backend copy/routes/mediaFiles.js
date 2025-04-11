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

// Recursive function to list files and folders
async function listFilesAndFolders(prefix = '') {
    try {
        const [files] = await bucket.getFiles({ prefix, delimiter: '/' });
        const items = { files: [], folders: {} };

        items.files = files
            .filter(file => !file.name.endsWith('/'))
            .map(file => ({
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
        console.error('Error fetching media files:', error);
        throw new Error('Error fetching files and folders');
    }
}

// Media files endpoint
router.get('/', async (req, res) => {
    try {
        const data = await listFilesAndFolders('Sakai Files/');
        res.json(data);
    } catch (error) {
        console.error('Error fetching media files:', error);
        res.status(500).json({ error: 'Failed to fetch media files' });
    }
});

module.exports = router;
