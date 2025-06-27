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

//-----------------------------------------------------------------------------------------------------------------------------------------------------------
// // File: src/pages/MediaFiles.js
// import React, { useState, useEffect, useCallback, useRef, useContext } from 'react';
// import './MediaFiles.css';
// import { FaFolder, FaFolderOpen, FaFileAlt, FaUpload, FaTrash, FaSpinner, FaEye, FaEdit } from 'react-icons/fa';
// import { fetchMediaTree, uploadMediaFile, deleteMediaFile } from '../api';
// import AuthContext from '../contexts/AuthContext'; // Import AuthContext as default
// import { ADMIN_USER_ROLES } from '../config/roles'; // <--- NEW: Import your roles config

// export default function MediaFiles() {
//     const { user } = useContext(AuthContext);

//     // *** CRITICAL CHANGE HERE ***
//     // Determine if the current user is an admin based on the ADMIN_USER_ROLES array
//     const isAdmin = user && ADMIN_USER_ROLES.includes(user.user_rank); //

//     const [tree, setTree] = useState(null);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState('');
//     const [uploading, setUploading] = useState(false);
//     const [uploadTargetFolder, setUploadTargetFolder] = useState('');
//     const fileInputRef = useRef(null);

//     const [viewMode, setViewMode] = useState('view');

//     const refreshTree = useCallback(async () => {
//         setLoading(true);
//         setError('');
//         try {
//             const data = await fetchMediaTree();
//             setTree(data);
//         } catch (err) {
//             console.error('Error loading media files:', err);
//             setError('Could not load files. Check console for details.');
//         } finally {
//             setLoading(false);
//         }
//     }, []);

//     useEffect(() => {
//         refreshTree();
//     }, [refreshTree]);

//     const handleFileChange = (event) => {
//         // ... (no change)
//     };

//     const handleUpload = async (e) => {
//         e.preventDefault();

//         if (!isAdmin) { // Check if the user is an admin using the updated isAdmin logic
//             setError('You do not have permission to upload files.');
//             return;
//         }

//         const selectedFile = fileInputRef.current.files[0];
//         if (!selectedFile) {
//             alert('Please select a file to upload.');
//             return;
//         }

//         setUploading(true);
//         setError('');
//         try {
//             const gcsPath = uploadTargetFolder.endsWith('/') ? uploadTargetFolder : (uploadTargetFolder ? uploadTargetFolder + '/' : '');

//             const checkFileExistsRecursively = (currentNode, targetPath, fileName) => {
//                 // ... (no change)
//             };

//             if (tree && checkFileExistsRecursively(tree, gcsPath, selectedFile.name)) {
//                  if (!window.confirm(`A file named "${selectedFile.name}" already exists in the selected folder. Do you want to replace it?`)) {
//                     setUploading(false);
//                     return;
//                 }
//             }

//             const res = await uploadMediaFile(selectedFile, gcsPath);
//             alert(`File "${selectedFile.name}" uploaded successfully!`);
//             fileInputRef.current.value = '';
//             setUploadTargetFolder('');
//             setTree(res.updatedTree);
//         } catch (err) {
//             console.error('Error uploading file:', err);
//             setError(`Failed to upload file: ${err.response?.data?.error || err.message}`);
//         } finally {
//             setUploading(false);
//         }
//     };

//     const handleDelete = async (fullPath, fileName) => {
//         if (!isAdmin) { // Check if the user is an admin using the updated isAdmin logic
//             setError('You do not have permission to delete files.');
//             return;
//         }

//         if (!window.confirm(`Are you sure you want to delete "${fileName}"? This action cannot be undone.`)) {
//             return;
//         }

//         setLoading(true);
//         setError('');
//         try {
//             const res = await deleteMediaFile(fullPath);
//             alert(`File "${fileName}" deleted successfully!`);
//             setTree(res.updatedTree);
//         } catch (err) {
//             if (err.response?.status === 404) {
//                 setError('File not found or already deleted.');
//             } else {
//                 console.error('Error deleting file:', err);
//                 setError(`Failed to delete file: ${err.response?.data?.error || err.message}`);
//             }
//         } finally {
//             setLoading(false);
//         }
//     };

//     const noFiles = Array.isArray(tree?.files) && tree.files.length === 0;
//     const noFolders = tree?.folders && Object.keys(tree.folders).length === 0;
//     const isEmpty = !tree || (noFiles && noFolders);

//     const renderTree = (node, currentPath = '') => (
//         <ul className="file-tree">
//             {node.files?.map((f, i) => (
//                 <li key={`file-${f.fullPath}`} className="file-item">
//                     <FaFileAlt className="file-icon" />
//                     <a href={f.url} target="_blank" rel="noopener noreferrer">
//                         {f.name}
//                     </a>
//                     {viewMode === 'manage' && isAdmin && (
//                         <button
//                             className="delete-btn"
//                             onClick={() => handleDelete(f.fullPath, f.name)}
//                             disabled={loading || uploading}
//                             title="Delete File"
//                         >
//                             <FaTrash />
//                         </button>
//                     )}
//                 </li>
//             ))}
//             {node.folders && Object.entries(node.folders).map(([name, sub], i) => {
//                 const folderFullPath = currentPath ? `${currentPath}/${name}` : name;
//                 return (
//                     <li key={`folder-${folderFullPath}`} className="folder-item">
//                         <details className="folder-details">
//                             <summary>
//                                 <span className="folder-icon">
//                                     <FaFolder className="folder-closed" />
//                                     <FaFolderOpen className="folder-open" />
//                                 </span>
//                                 {name}
//                                 {viewMode === 'manage' && isAdmin && (
//                                     <button
//                                         className="set-upload-target-btn"
//                                         onClick={(e) => {
//                                             e.stopPropagation();
//                                             setUploadTargetFolder(folderFullPath);
//                                             e.currentTarget.classList.add('selected-target');
//                                             setTimeout(() => e.currentTarget.classList.remove('selected-target'), 1000);
//                                         }}
//                                         disabled={uploading}
//                                         title="Set as Upload Destination"
//                                     >
//                                         <FaUpload />
//                                     </button>
//                                 )}
//                             </summary>
//                             {renderTree(sub, folderFullPath)}
//                         </details>
//                     </li>
//                 );
//             })}
//         </ul>
//     );

//     if (loading && !tree) return <p>Loading files…</p>;
//     if (error) return <p className="error-message">{error}</p>;

//     return (
//         <div className="media-files-container">
//             <h1>Media Files</h1>

//             <div className="view-mode-toggles">
//                 <button
//                     className={`mode-btn ${viewMode === 'view' ? 'active' : ''}`}
//                     onClick={() => setViewMode('view')}
//                 >
//                     <FaEye /> View Files
//                 </button>
//                 {isAdmin && ( // This button is visible if isAdmin is true
//                     <button
//                         className={`mode-btn ${viewMode === 'manage' ? 'active' : ''}`}
//                         onClick={() => setViewMode('manage')}
//                     >
//                         <FaEdit /> Manage Files
//                     </button>
//                 )}
//             </div>

//             {viewMode === 'manage' && isAdmin && ( // The upload section is visible only if in 'manage' mode AND isAdmin is true
//                 <div className="upload-section">
//                     <h2>Upload New File</h2>
//                     <form onSubmit={handleUpload}>
//                         <input
//                             type="file"
//                             id="file-upload-input"
//                             onChange={handleFileChange}
//                             ref={fileInputRef}
//                             disabled={uploading}
//                         />
//                         <div className="upload-target-display">
//                             Upload Destination: <strong>{uploadTargetFolder || "Root Folder"}</strong>
//                             {uploadTargetFolder && (
//                                 <button
//                                     type="button"
//                                     onClick={() => setUploadTargetFolder('')}
//                                     disabled={uploading}
//                                     className="clear-target-btn"
//                                     title="Set Root as Upload Destination"
//                                 >
//                                     Clear Target
//                                 </button>
//                             )}
//                         </div>
//                         <button type="submit" disabled={uploading || !fileInputRef.current?.files[0]}>
//                             {uploading ? <> <FaSpinner className="spinner-icon" /> Uploading…</> : 'Upload File'}
//                         </button>
//                     </form>
//                 </div>
//             )}

//             {isEmpty ? (
//                 <p className="no-files-message">No files found.</p>
//             ) : (
//                 <div className={`file-tree-wrapper ${loading ? 'loading-overlay' : ''}`}>
//                     {loading && <div className="spinner"></div>}
//                     {renderTree(tree)}
//                 </div>
//             )}
//         </div>
//     );
// }

// File: src/pages/MediaFiles.js
import React, { useState, useEffect, useCallback, useRef, useContext } from 'react';
import './MediaFiles.css';
import { FaFolder, FaFolderOpen, FaFileAlt, FaUpload, FaTrash, FaSpinner, FaEye, FaEdit } from 'react-icons/fa';
import { fetchMediaTree, uploadMediaFile, deleteMediaFile } from '../api';
import AuthContext from '../contexts/AuthContext';
import { ADMIN_USER_ROLES } from '../config/roles'; // Import your roles config

export default function MediaFiles() {
    const { user } = useContext(AuthContext);

    // Determine if the current user is an admin based on the ADMIN_USER_ROLES array
    const isAdmin = user && ADMIN_USER_ROLES.includes(user.user_rank);

    const [tree, setTree] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [uploading, setUploading] = useState(false);
    const [uploadTargetFolder, setUploadTargetFolder] = useState('');
    const fileInputRef = useRef(null);

    const [viewMode, setViewMode] = useState('view');

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

    const handleFileChange = (event) => {
        // You could add logic here to display selected file name if desired
    };

    const handleUpload = async (e) => {
        e.preventDefault();

        if (!isAdmin) {
            setError('You do not have permission to upload files.');
            return;
        }

        const selectedFile = fileInputRef.current.files[0];
        if (!selectedFile) {
            alert('Please select a file to upload.');
            return;
        }

        setUploading(true);
        setError('');
        try {
            const gcsPath = uploadTargetFolder.endsWith('/') ? uploadTargetFolder : (uploadTargetFolder ? uploadTargetFolder + '/' : '');

            const checkFileExistsRecursively = (currentNode, targetPath, fileName) => {
                if (currentNode.files && currentNode.files.some(f => f.name === fileName && f.fullPath.startsWith(targetPath))) {
                    return true;
                }
                if (currentNode.folders) {
                    for (const folderName in currentNode.folders) {
                        const subfolderPath = targetPath + folderName + '/';
                        if (checkFileExistsRecursively(currentNode.folders[folderName], subfolderPath, fileName)) {
                            return true;
                        }
                    }
                }
                return false;
            };

            if (tree && checkFileExistsRecursively(tree, gcsPath, selectedFile.name)) {
                 if (!window.confirm(`A file named "${selectedFile.name}" already exists in the selected folder. Do you want to replace it?`)) {
                    setUploading(false);
                    return;
                }
            }

            const res = await uploadMediaFile(selectedFile, gcsPath);
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

    const handleDelete = async (fullPath, fileName) => {
        if (!isAdmin) {
            setError('You do not have permission to delete files.');
            return;
        }

        if (!window.confirm(`Are you sure you want to delete "${fileName}"? This action cannot be undone.`)) {
            return;
        }

        setLoading(true);
        setError('');
        try {
            const res = await deleteMediaFile(fullPath);
            alert(`File "${fileName}" deleted successfully!`);
            setTree(res.updatedTree); // Update tree directly from backend response
        } catch (err) {
            if (err.response?.status === 404) {
                setError('File not found or already deleted.');
            } else {
                console.error('Error deleting file:', err);
                setError(`Failed to delete file: ${err.response?.data?.error || err.message}`);
            }
        } finally {
            setLoading(false);
        }
    };

    const noFiles = Array.isArray(tree?.files) && tree.files.length === 0;
    const noFolders = tree?.folders && Object.keys(tree.folders).length === 0;
    const isEmpty = !tree || (noFiles && noFolders);

    const renderTree = (node, currentPath = '') => (
        <ul className="file-tree">
            {node.files?.map((f, i) => (
                <li key={`file-${f.fullPath}`} className="file-item">
                    <FaFileAlt className="file-icon" />
                    <a href={f.url} target="_blank" rel="noopener noreferrer">
                        {f.name}
                    </a>
                    {viewMode === 'manage' && isAdmin && (
                        <button
                            className="delete-btn"
                            onClick={() => handleDelete(f.fullPath, f.name)}
                            disabled={loading || uploading}
                            title="Delete File"
                        >
                            <FaTrash />
                        </button>
                    )}
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
                                {viewMode === 'manage' && isAdmin && (
                                    <button
                                        className="set-upload-target-btn"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setUploadTargetFolder(folderFullPath);
                                            // Added null checks to prevent error
                                            if (e.currentTarget) {
                                                e.currentTarget.classList.add('selected-target');
                                                setTimeout(() => {
                                                    if (e.currentTarget) {
                                                        e.currentTarget.classList.remove('selected-target');
                                                    }
                                                }, 1000);
                                            }
                                        }}
                                        disabled={uploading}
                                        title="Set as Upload Destination"
                                    >
                                        <FaUpload />
                                    </button>
                                )}
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
            <h1>Media Files</h1>

            <div className="view-mode-toggles">
                <button
                    className={`mode-btn ${viewMode === 'view' ? 'active' : ''}`}
                    onClick={() => setViewMode('view')}
                >
                    <FaEye /> View Files
                </button>
                {isAdmin && (
                    <button
                        className={`mode-btn ${viewMode === 'manage' ? 'active' : ''}`}
                        onClick={() => setViewMode('manage')}
                    >
                        <FaEdit /> Manage Files
                    </button>
                )}
            </div>

            {viewMode === 'manage' && isAdmin && (
                <div className="upload-section">
                    <h2>Upload New File</h2>
                    <form onSubmit={handleUpload}>
                        <input
                            type="file"
                            id="file-upload-input"
                            onChange={handleFileChange}
                            ref={fileInputRef}
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
            )}

            {isEmpty ? (
                <p className="no-files-message">No files found.</p>
            ) : (
                <div className={`file-tree-wrapper ${loading ? 'loading-overlay' : ''}`}>
                    {loading && <div className="spinner"></div>}
                    {renderTree(tree)}
                </div>
            )}
        </div>
    );
}
