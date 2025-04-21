// File: src/App.js
import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate
} from 'react-router-dom';

import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Coverages from './pages/Coverages';
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
      <AppContent />
    </Router>
  );
}

function AppContent() {
  const location = useLocation();
  const isLogin = location.pathname === '/';

  if (isLogin) {
    return (
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Routes>
          <Route
            path="/dashboard"
            element={
              <AuthenticatedRoute>
                <Dashboard />
              </AuthenticatedRoute>
            }
          />
          <Route
            path="/coverages"
            element={
              <AuthenticatedRoute>
                <Coverages />
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
        </Routes>
      </div>
      <Chatbot />
    </div>
  );
}


export default App;
