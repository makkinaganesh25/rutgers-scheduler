// // File: src/App.js
// import React from 'react';
// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import Sidebar from './components/Sidebar';
// import Dashboard from './pages/Dashboard';
// import Calendar from './pages/Calendar';
// import Notifications from './pages/Notifications';
// import MediaFiles from './pages/MediaFiles';
// import FAQ from './pages/FAQ';
// import Login from './pages/Login';
// import AuthenticatedRoute from './components/AuthenticatedRoute';
// import Chatbot from './components/Chatbot';
// import ShiftList from './pages/ShiftList';

// function App() {
//   return (
//     <Router>
//       <div className="app-container">
//         <Routes>
//           <Route path="/" element={<Login />} />
//           <Route
//             path="/dashboard"
//             element={
//               <AuthenticatedRoute>
//                 <Sidebar />
//                 <Dashboard />
//               </AuthenticatedRoute>
//             }
//           />
//           <Route
//             path="/calendar"
//             element={
//               <AuthenticatedRoute>
//                 <Sidebar />
//                 <Calendar />
//               </AuthenticatedRoute>
//             }
//           />
//           <Route
//             path="/notifications"
//             element={
//               <AuthenticatedRoute>
//                 <Sidebar />
//                 <Notifications />
//               </AuthenticatedRoute>
//             }
//           />
//           <Route
//             path="/media-files"
//             element={
//               <AuthenticatedRoute>
//                 <Sidebar />
//                 <MediaFiles />
//               </AuthenticatedRoute>
//             }
//           />
//           <Route
//             path="/shifts"
//             element={
//               <AuthenticatedRoute>
//                 <Sidebar />
//                 <ShiftList />
//               </AuthenticatedRoute>
//             }
//           />
//           <Route
//             path="/faq"
//             element={
//               <AuthenticatedRoute>
//                 <Sidebar />
//                 <FAQ />
//               </AuthenticatedRoute>
//             }
//           />
//         </Routes>
//         <Chatbot />
//       </div>
//     </Router>
//   );
// }

// export default App;

// File: src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Calendar from './pages/Calendar';
import Notifications from './pages/Notifications';
import MediaFiles from './pages/MediaFiles';
import FAQ from './pages/FAQ';
import Login from './pages/Login';
import AuthenticatedRoute from './components/AuthenticatedRoute';
import Chatbot from './components/Chatbot';
import ShiftList from './pages/ShiftList';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Sidebar />
        <div className="main-content">
          <Routes>
            <Route path="/" element={<Login />} />
            <Route
              path="/dashboard"
              element={
                <AuthenticatedRoute>
                  <Dashboard />
                </AuthenticatedRoute>
              }
            />
            <Route
              path="/calendar"
              element={
                <AuthenticatedRoute>
                  <Calendar />
                </AuthenticatedRoute>
              }
            />
            <Route
              path="/notifications"
              element={
                <AuthenticatedRoute>
                  <Notifications />
                </AuthenticatedRoute>
              }
            />
            <Route
              path="/media-files"
              element={
                <AuthenticatedRoute>
                  <MediaFiles />
                </AuthenticatedRoute>
              }
            />
            <Route
              path="/shifts"
              element={
                <AuthenticatedRoute>
                  <ShiftList />
                </AuthenticatedRoute>
              }
            />
            <Route
              path="/faq"
              element={
                <AuthenticatedRoute>
                  <FAQ />
                </AuthenticatedRoute>
              }
            />
            <Route path="*" element={<Login />} />
          </Routes>
        </div>
        <Chatbot />
      </div>
    </Router>
  );
}

export default App;
