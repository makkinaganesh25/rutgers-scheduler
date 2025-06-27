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

// File: src/pages/MediaFiles.js
import React, { useState, useEffect, useCallback, useRef } from 'react';
import './MediaFiles.css';
import { FaFolder, FaFolderOpen, FaFileAlt, FaUpload, FaTrash, FaSpinner } from 'react-icons/fa';
import { fetchMediaTree, uploadMediaFile, deleteMediaFile } from '../api';

export default function MediaFiles() {
    const [tree, setTree] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [uploading, setUploading] = useState(false);
    const [uploadTargetFolder, setUploadTargetFolder] = useState('');
    const fileInputRef = useRef(null); // Ref for the file input element

    // Function to refresh the file tree
    const refreshTree = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const data = await fetchMediaTree();
            setTree(data);
        } catch (err) {
            console.error('Error loading media files:', err);
            setError('Could not load files. Check console for details.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        refreshTree();
    }, [refreshTree]);

    // Handle file selection for upload
    const handleFileChange = (event) => {
        // No direct state for selectedFile; we get it directly from ref in handleUpload
    };

    // Handle upload submission
    const handleUpload = async (e) => {
        e.preventDefault(); // Prevent default form submission

        const selectedFile = fileInputRef.current.files[0];
        if (!selectedFile) {
            alert('Please select a file to upload.');
            return;
        }

        setUploading(true);
        setError('');
        try {
            // uploadTargetFolder needs to be the full GCS path for the folder
            const gcsPath = uploadTargetFolder.endsWith('/') ? uploadTargetFolder : (uploadTargetFolder ? uploadTargetFolder + '/' : '');
            
            // Check if the file already exists in the target folder to prevent overwrites
            const existingFile = tree?.folders[uploadTargetFolder.split('/')[0]]?.files?.find(f => 
                f.name === selectedFile.name && f.fullPath === `${gcsPath}${selectedFile.name}`
            );
            if (existingFile && !window.confirm(`A file named "${selectedFile.name}" already exists in this folder. Do you want to replace it?`)) {
                setUploading(false);
                return;
            }


            const res = await uploadMediaFile(selectedFile, gcsPath); // res.updatedTree contains the latest tree
            alert(`File "${selectedFile.name}" uploaded successfully!`);
            fileInputRef.current.value = ''; // Clear file input
            setUploadTargetFolder(''); // Reset target folder
            setTree(res.updatedTree); // Update tree directly from backend response
        } catch (err) {
            console.error('Error uploading file:', err);
            setError(`Failed to upload file: ${err.response?.data?.error || err.message}`);
        } finally {
            setUploading(false);
        }
    };

    // Handle file deletion
    const handleDelete = async (fullPath, fileName) => {
        if (!window.confirm(`Are you sure you want to delete "${fileName}"? This action cannot be undone.`)) {
            return;
        }

        setLoading(true); // Indicate loading while deleting and refreshing
        setError('');
        try {
            const res = await deleteMediaFile(fullPath); // res.updatedTree contains the latest tree
            alert(`File "${fileName}" deleted successfully!`);
            setTree(res.updatedTree); // Update tree directly from backend response
        } catch (err) {
            console.error('Error deleting file:', err);
            setError(`Failed to delete file: ${err.response?.data?.error || err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const noFiles = Array.isArray(tree?.files) && tree.files.length === 0;
    const noFolders = tree?.folders && Object.keys(tree.folders).length === 0;
    const isEmpty = !tree || (noFiles && noFolders);

    // Recursive renderer function
    const renderTree = (node, currentPath = '') => (
        <ul className="file-tree">
            {node.files?.map((f, i) => (
                <li key={`file-${f.fullPath}`} className="file-item">
                    <FaFileAlt className="file-icon" />
                    <a href={f.url} target="_blank" rel="noopener noreferrer">
                        {f.name}
                    </a>
                    <button
                        className="delete-btn"
                        onClick={() => handleDelete(f.fullPath, f.name)}
                        disabled={loading || uploading}
                        title="Delete File"
                    >
                        <FaTrash />
                    </button>
                </li>
            ))}
            {node.folders && Object.entries(node.folders).map(([name, sub], i) => {
                const folderFullPath = currentPath ? `${currentPath}/${name}` : name;
                return (
                    <li key={`folder-${folderFullPath}`} className="folder-item">
                        <details className="folder-details">
                            <summary>
                                <span className="folder-icon">
                                    <FaFolder className="folder-closed" />
                                    <FaFolderOpen className="folder-open" />
                                </span>
                                {name}
                                <button
                                    className="set-upload-target-btn"
                                    onClick={(e) => {
                                        e.stopPropagation(); // Prevent folder details from toggling
                                        setUploadTargetFolder(folderFullPath);
                                        // Optional: visual feedback
                                        e.currentTarget.classList.add('selected-target');
                                        setTimeout(() => e.currentTarget.classList.remove('selected-target'), 1000);
                                    }}
                                    disabled={uploading}
                                    title="Set as Upload Destination"
                                >
                                    <FaUpload />
                                </button>
                            </summary>
                            {renderTree(sub, folderFullPath)}
                        </details>
                    </li>
                );
            })}
        </ul>
    );

    if (loading && !tree) return <p>Loading files…</p>;
    if (error) return <p className="error-message">{error}</p>;

    return (
        <div className="media-files-container">
            <h1>Manage Media Files</h1>

            <div className="upload-section">
                <h2>Upload New File</h2>
                <form onSubmit={handleUpload}>
                    <input
                        type="file"
                        id="file-upload-input"
                        onChange={handleFileChange}
                        ref={fileInputRef} // Attach ref here
                        disabled={uploading}
                    />
                    <div className="upload-target-display">
                        Upload Destination: <strong>{uploadTargetFolder || "Root Folder"}</strong>
                        {uploadTargetFolder && (
                            <button
                                type="button"
                                onClick={() => setUploadTargetFolder('')}
                                disabled={uploading}
                                className="clear-target-btn"
                                title="Set Root as Upload Destination"
                            >
                                Clear Target
                            </button>
                        )}
                    </div>
                    <button type="submit" disabled={uploading || !fileInputRef.current?.files[0]}>
                        {uploading ? <> <FaSpinner className="spinner-icon" /> Uploading…</> : 'Upload File'}
                    </button>
                </form>
            </div>

            {isEmpty ? (
                <p className="no-files-message">No files found. Upload some!</p>
            ) : (
                <div className={`file-tree-wrapper ${loading ? 'loading-overlay' : ''}`}>
                    {loading && <div className="spinner"></div>}
                    {renderTree(tree)}
                </div>
            )}
        </div>
    );
}
