// src/components/FolderTree.js
import React from 'react';

const FolderTree = ({ folder }) => {
    return (
        <ul>
            {Object.entries(folder).map(([key, value]) => (
                <li key={key}>
                    {value.files ? (
                        // If it contains 'files', render them
                        <div className="folder">
                            <strong>{key}</strong>
                            <ul>
                                {value.files.map(file => (
                                    <li key={file.name}>
                                        <a href={file.url} target="_blank" rel="noopener noreferrer">
                                            {file.name}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ) : (
                        // Otherwise, treat it as a subfolder
                        <div className="folder">
                            <strong>{key}</strong>
                            <FolderTree folder={value} />
                        </div>
                    )}
                </li>
            ))}
        </ul>
    );
};

export default FolderTree;
