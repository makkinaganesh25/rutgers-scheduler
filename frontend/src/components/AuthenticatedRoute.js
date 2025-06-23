// // src/components/AuthenticatedRoute.jsx
// import React from 'react';
// import { Outlet, Navigate } from 'react-router-dom';
// import { useAuth } from '../contexts/AuthContext';

// export default function AuthenticatedRoute() {
//   const { user } = useAuth();
//   return user
//     ? <Outlet />
//     : <Navigate to="/" replace />;
// }

// export function RoleRoute({ allowedRoles }) {
//   const { user } = useAuth();
//   if (!user) return <Navigate to="/" replace />;
//   return allowedRoles.includes(user.user_rank)
//     ? <Outlet />
//     : (
//       <div style={{
//         padding: '2rem',
//         textAlign: 'center',
//         color: '#555'
//       }}>
//         <h2>Access Denied</h2>
//         <p>You don’t have permission to view the Overview.<br/>
//         Please contact your supervisor.</p>
//       </div>
//     );
// }


// src/components/AuthenticatedRoute.jsx
import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Wraps all routes that require you to be logged in
export default function AuthenticatedRoute() {
  const { user } = useAuth();
  if (!user) {
    // not logged in → kick back to login
    return <Navigate to="/" replace />;
  }
  // logged in → render child <Route>s
  return <Outlet />;
}

// Wraps all routes that require a specific set of roles
export function RoleRoute({ allowedRoles, children }) {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/" replace />;
  }
  if (!allowedRoles.includes(user.user_rank)) {
    // logged in but not in the allowedRoles
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>Access Denied</h2>
        <p>
          You don’t have permission to view this page.<br/>
          Please contact your supervisor if you believe this is in error.
        </p>
      </div>
    );
  }
  return children;
}
