// src/components/AuthenticatedRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';

function AuthenticatedRoute({ children }) {
    const token = localStorage.getItem('token'); // Check if the token exists
    return token ? children : <Navigate to="/" />; // Redirect to login if not logged in
}

export default AuthenticatedRoute;
