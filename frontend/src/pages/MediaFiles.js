// // File: src/pages/MediaFiles.js
// import React, { useState, useEffect } from 'react';
// import './MediaFiles.css';
// import { FaFolder, FaFolderOpen, FaFileAlt } from 'react-icons/fa';

// export default function MediaFiles() {
//   const [data, setData]       = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError]     = useState('');

//   useEffect(() => {
//     async function fetchData() {
//       try {
//         const res = await fetch('http://localhost:5001/api/media-files');
//         if (!res.ok) throw new Error(`HTTP ${res.status}`);
//         const json = await res.json();
//         setData(json);
//       } catch (err) {
//         console.error('Error fetching media files:', err);
//         setError('Could not load files.');
//       } finally {
//         setLoading(false);
//       }
//     }
//     fetchData();
//   }, []);

//   // both files & folders empty? treat as no data
//   const noFiles   = Array.isArray(data?.files) && data.files.length === 0;
//   const noFolders = data?.folders && Object.keys(data.folders).length === 0;
//   const isEmpty   = !data || (noFiles && noFolders);

//   const renderTree = (node) => (
//     <ul className="file-tree">
//       {node.files?.map((f,i) => (
//         <li key={`file-${i}`} className="file-item">
//           <FaFileAlt className="file-icon" />
//           <a href={f.url} target="_blank" rel="noopener noreferrer">
//             {f.name}
//           </a>
//         </li>
//       ))}

//       {node.folders &&
//         Object.entries(node.folders).map(([folderName, subtree], i) => (
//           <li key={`folder-${i}`} className="folder-item">
//             <details className="folder-details">
//               <summary>
//                 <span className="folder-icon">
//                   <FaFolder className="folder-closed" />
//                   <FaFolderOpen className="folder-open" />
//                 </span>
//                 {folderName}
//               </summary>
//               {renderTree(subtree)}
//             </details>
//           </li>
//         ))}
//     </ul>
//   );

//   if (loading) return <p>Loading files…</p>;
//   if (error)   return <p className="error-message">{error}</p>;

//   return (
//     <div className="media-files-container">
//       <h1>Media Files</h1>
//       {isEmpty
//         ? <p>No files found.</p>
//         : renderTree(data)
//       }
//     </div>
//   );
// }

// src/pages/MediaFiles.js
import React, { useState, useEffect } from 'react';
import './MediaFiles.css';
import { FaFolder, FaFolderOpen, FaFileAlt } from 'react-icons/fa';
import { fetchMediaTree } from '../api';

export default function MediaFiles() {
  const [tree,   setTree]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchMediaTree();
        setTree(data);
      } catch (err) {
        console.error('Error loading media files:', err);
        setError('Could not load files.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // detect “empty”
  const noFiles   = Array.isArray(tree?.files) && tree.files.length === 0;
  const noFolders = tree?.folders && Object.keys(tree.folders).length === 0;
  const isEmpty   = !tree || (noFiles && noFolders);

  // recursive renderer
  const renderTree = node => (
    <ul className="file-tree">
      {node.files?.map((f,i) => (
        <li key={`file-${i}`} className="file-item">
          <FaFileAlt className="file-icon" />
          <a href={f.url} target="_blank" rel="noopener noreferrer">
            {f.name}
          </a>
        </li>
      ))}
      {node.folders && Object.entries(node.folders).map(([name, sub], i) => (
        <li key={`folder-${i}`} className="folder-item">
          <details className="folder-details">
            <summary>
              <span className="folder-icon">
                <FaFolder className="folder-closed" />
                <FaFolderOpen className="folder-open" />
              </span>
              {name}
            </summary>
            {renderTree(sub)}
          </details>
        </li>
      ))}
    </ul>
  );

  if (loading) return <p>Loading files…</p>;
  if (error)   return <p className="error-message">{error}</p>;

  return (
    <div className="media-files-container">
      <h1>Media Files</h1>
      {isEmpty
        ? <p>No files found.</p>
        : renderTree(tree)
      }
    </div>
  );
}
