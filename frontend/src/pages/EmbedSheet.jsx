// src/pages/EmbedSheet.jsx
import React from 'react';
import './EmbedSheet.css';

export default function EmbedSheet() {
  const url = process.env.REACT_APP_SHEET_PUBLISH_URL;
  return (
    <div className="embed-container">
      {!url ? (
        <p className="embed-error">
          No sheet URL specified. Please set <code>REACT_APP_SHEET_PUBLISH_URL</code>.
        </p>
      ) : (
        <iframe
          title="Google Sheet"
          src={url}
          className="embed-iframe"
          frameBorder="0"
          allowFullScreen
        />
      )}
    </div>
  );
}
