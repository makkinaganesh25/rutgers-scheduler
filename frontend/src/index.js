// // File: src/index.js
// import React from 'react';
// import ReactDOM from 'react-dom';
// import './index.css';
// import 'antd/dist/antd.css';
// import App from './App';
// import { AuthProvider } from './contexts/AuthContext';

// ReactDOM.render(
//   <React.StrictMode>
//     <AuthProvider>
//       <App />
//     </AuthProvider>
//   </React.StrictMode>,
//   document.getElementById('root')
// );
//----------------------------------------------------------
//working one
// import React from 'react';
// import ReactDOM from 'react-dom';
// import './index.css';
// // use the minified CSS path so webpack picks it up from node_modules
// // import 'antd/dist/antd.min.css';
// // import 'antd/dist/antd.css';

// import App from './App';
// import { AuthProvider } from './contexts/AuthContext';

// ReactDOM.render(
//   <React.StrictMode>
//     <AuthProvider>
//       <App />
//     </AuthProvider>
//   </React.StrictMode>,
//   document.getElementById('root')
// );


//--------------------------------------------

import React from 'react';
import ReactDOM from 'react-dom/client';        // ← use the new entrypoint
import './index.css';

import App from './App';
import { AuthProvider } from './contexts/AuthContext';

const container = document.getElementById('root');
// createRoot replaces ReactDOM.render in React 18+
const root = ReactDOM.createRoot(container);

root.render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
