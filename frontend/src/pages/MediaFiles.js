// // src/pages/MediaFiles.js
// import React, { useState, useEffect } from 'react';
// import './MediaFiles.css';
// import { FaFolder, FaFolderOpen, FaFileAlt } from 'react-icons/fa';
// import { fetchMediaTree } from '../api';

// export default function MediaFiles() {
//   const [tree,   setTree]   = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error,   setError]   = useState('');

//   useEffect(() => {
//     (async () => {
//       try {
//         const data = await fetchMediaTree();
//         setTree(data);
//       } catch (err) {
//         console.error('Error loading media files:', err);
//         setError('Could not load files.');
//       } finally {
//         setLoading(false);
//       }
//     })();
//   }, []);

//   // detect “empty”
//   const noFiles   = Array.isArray(tree?.files) && tree.files.length === 0;
//   const noFolders = tree?.folders && Object.keys(tree.folders).length === 0;
//   const isEmpty   = !tree || (noFiles && noFolders);

//   // recursive renderer
//   const renderTree = node => (
//     <ul className="file-tree">
//       {node.files?.map((f,i) => (
//         <li key={`file-${i}`} className="file-item">
//           <FaFileAlt className="file-icon" />
//           <a href={f.url} target="_blank" rel="noopener noreferrer">
//             {f.name}
//           </a>
//         </li>
//       ))}
//       {node.folders && Object.entries(node.folders).map(([name, sub], i) => (
//         <li key={`folder-${i}`} className="folder-item">
//           <details className="folder-details">
//             <summary>
//               <span className="folder-icon">
//                 <FaFolder className="folder-closed" />
//                 <FaFolderOpen className="folder-open" />
//               </span>
//               {name}
//             </summary>
//             {renderTree(sub)}
//           </details>
//         </li>
//       ))}
//     </ul>
//   );

//   if (loading) return <p>Loading files…</p>;
//   if (error)   return <p className="error-message">{error}</p>;

//   return (
//     <div className="media-files-container">
//       <h1>Media Files</h1>
//       {isEmpty
//         ? <p>No files found.</p>
//         : renderTree(tree)
//       }
//     </div>
//   );
// }


// File: backend/routes/media.js
require('dotenv').config();
const express = require('express');
const { Storage } = require('@google-cloud/storage');
const path = require('path');
const multer = require('multer'); // Multer is already in your package.json

const router = express.Router();

// Initialize Google Cloud Storage using environment variable for credentials
const storage = new Storage({
    credentials: JSON.parse(process.env.GCP_SERVICE_ACCOUNT_KEY),
    projectId: process.env.PROJECT_ID, // Ensure PROJECT_ID is also set in Render env
});
const bucketName = 'sakai_files'; // Your GCS bucket name, ensure this is correct
const bucket = storage.bucket(bucketName);

// Configure Multer for in-memory storage
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB file size limit (adjust as needed)
    },
});

// --- Helper Function: List Files and Folders ---
async function listFilesAndFolders(prefix = '') {
    const [files] = await bucket.getFiles({ prefix, delimiter: '/' });
    const items = { files: [], folders: {} };

    // 1) Files at this level
    items.files = files
        .filter(f => !f.name.endsWith('/'))
        .map(f => ({
            name: f.name.split('/').pop(),
            fullPath: f.name, // Add fullPath for deletion
            url: `https://storage.googleapis.com/${bucketName}/${f.name}`,
        }));

    // 2) Sub-folders at this level
    // bucket.getFiles returns prefixes for "directories" when delimiter is used
    const [, , apiResponse] = await bucket.getFiles({ prefix, delimiter: '/' });
    const prefixes = apiResponse.prefixes || [];
    for (const folderPrefix of prefixes) {
        const folderName = folderPrefix.slice(prefix.length).replace(/\/$/, '');
        items.folders[folderName] = await listFilesAndFolders(folderPrefix);
    }

    return items;
}

// --- Route: Get Media Files Tree ---
router.get('/', async (req, res) => {
    try {
        const data = await listFilesAndFolders('');
        return res.json(data);
    } catch (error) {
        console.error('Error fetching media files:', error);
        return res.status(500).json({ error: 'Failed to fetch media files' });
    }
});

// --- Route: Upload File ---
router.post('/upload', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded.' });
    }

    const { destinationFolder = '' } = req.body;
    const fileName = req.file.originalname;
    const gcsFileName = path.join(destinationFolder, fileName).replace(/\\/g, '/'); // Ensure forward slashes for GCS

    try {
        const blob = bucket.file(gcsFileName);
        const blobStream = blob.createWriteStream({
            resumable: false,
            metadata: {
                contentType: req.file.mimetype,
            },
        });

        blobStream.on('error', err => {
            console.error('Upload stream error:', err);
            res.status(500).json({ error: 'File upload failed.' });
        });

        blobStream.on('finish', async () => {
            console.log(`File ${gcsFileName} uploaded successfully.`);
            const updatedTree = await listFilesAndFolders(''); // Refresh and send updated tree
            res.status(200).json({ message: 'File uploaded successfully', newFile: { name: fileName, fullPath: gcsFileName }, updatedTree });
        });

        blobStream.end(req.file.buffer);

    } catch (error) {
        console.error('Error uploading file to GCS:', error);
        res.status(500).json({ error: 'Server error during file upload.' });
    }
});

// --- Route: Delete File ---
router.delete('/delete', async (req, res) => {
    const { filePath } = req.body;

    if (!filePath) {
        return res.status(400).json({ error: 'File path is required for deletion.' });
    }

    try {
        await bucket.file(filePath).delete();
        console.log(`File ${filePath} deleted successfully.`);
        const updatedTree = await listFilesAndFolders(''); // Refresh and send updated tree
        res.status(200).json({ message: 'File deleted successfully', updatedTree });
    } catch (error) {
        if (error.code === 404) {
            return res.status(404).json({ error: 'File not found.' });
        }
        console.error('Error deleting file from GCS:', error);
        res.status(500).json({ error: 'Server error during file deletion.' });
    }
});

module.exports = router;
