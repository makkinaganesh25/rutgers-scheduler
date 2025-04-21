// src/pages/MediaFiles.js
import React, { useState, useEffect } from 'react';
import './MediaFiles.css';
import { FaFolder, FaFolderOpen, FaFileAlt } from 'react-icons/fa';

const MediaFiles = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    // useEffect(() => {
    //     const fetchData = async () => {
    //         try {
    //             const response = await fetch('http://localhost:5500/api/media-files');
    //             const result = await response.json();
    //             setData(result);
    //             setLoading(false);
    //         } catch (error) {
    //             console.error('Error fetching media files:', error);
    //             setLoading(false);
    //         }
    //     };
    //     fetchData();
    // }, []);
    useEffect(() => {
        const fetchData = async () => {
          try {
            // const response = await fetch('http://localhost:5500/api/media-files');
            const response = await fetch('http://localhost:50001/api/media-files');
            console.log('Response status:', response.status); // Debugging: Log response status
            const result = await response.json();
            // console.log('Fetched data:', result); // Debugging: Log the result
            console.log('📦 Fetched data:', JSON.stringify(result, null, 2));
            console.log('✅ Has folders:', result.folders && Object.keys(result.folders).length > 0);
            console.log('✅ Has files:', result.files && result.files.length > 0);

            setData(result);
            setLoading(false);
          } catch (error) {
            console.error('Error fetching media files:', error);
            setLoading(false);
          }
        };
        fetchData();
      }, []);
      
    const renderFolderContents = (contents) => {
        return (
            <ul className="file-tree">
                {contents.files && contents.files.map((file, index) => (
                    <li key={index} className="file-item">
                        <FaFileAlt className="file-icon" />
                        <a href={file.url} target="_blank" rel="noopener noreferrer">{file.name}</a>
                    </li>
                ))}
                {contents.folders && Object.keys(contents.folders).map((folderName, index) => (
                    <li key={index} className="folder-item">
                        <details className="folder-details">
                            <summary>
                                <span className="folder-icon">
                                    <FaFolder className="folder-closed" />
                                    <FaFolderOpen className="folder-open" />
                                </span>
                                {folderName}
                            </summary>
                            {renderFolderContents(contents.folders[folderName])}
                        </details>
                    </li>
                ))}
            </ul>
        );
    };

    if (loading) {
        return <p>Loading...</p>;
    }

    return (
        <div className="media-files-container">
            <h1>Media Files</h1>
            {data ? renderFolderContents(data) : <p>No files found.</p>}
        </div>
    );
};

export default MediaFiles;
