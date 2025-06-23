// src/contexts/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user,  setUser]  = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')); }
    catch { return null; }
  });

  // sync localStorage
  useEffect(() => {
    if (token && user) {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }, [token, user]);

  function login({ token: newToken, ...userData }) {
    setToken(newToken);
    setUser(userData);
  }

  function logout() {
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export default AuthContext;

// //---------------------------------------------------------------------------------------------------------
// // src/contexts/AuthContext.js
// import React, { createContext, useState, useEffect, useContext } from 'react';
// import api from '../api';                             // your axios instance
// import { firebaseAuth } from '../firebaseConfig';     // your Firebase app auth
// import { signInWithCustomToken, signOut as fbSignOut } from 'firebase/auth';

// const AuthContext = createContext();

// export function AuthProvider({ children }) {
//   const [token, setToken] = useState(localStorage.getItem('token'));
//   const [user,  setUser]  = useState(() => {
//     try { return JSON.parse(localStorage.getItem('user')); }
//     catch { return null; }
//   });

//   // sync token/user into localStorage
//   useEffect(() => {
//     if (token && user) {
//       localStorage.setItem('token', token);
//       localStorage.setItem('user', JSON.stringify(user));
//     } else {
//       localStorage.removeItem('token');
//       localStorage.removeItem('user');
//     }
//   }, [token, user]);

//   // whenever our app‐level token changes, get a Firebase custom token and sign in
//   useEffect(() => {
//     if (!token) {
//       // on logout, also sign out of Firebase
//       fbSignOut(firebaseAuth).catch(console.error);
//       return;
//     }

//     (async () => {
//       try {
//         // call your backend to mint a Firebase custom token
//         const { data } = await api.post(
//           '/firebase/custom-token',
//           null,
//           { headers: { Authorization: `Bearer ${token}` } }
//         );
//         // sign in to Firebase
//         await signInWithCustomToken(firebaseAuth, data.firebaseToken);
//       } catch (err) {
//         console.error('Firebase sign-in error:', err);
//       }
//     })();
//   }, [token]);

//   // preserve existing login/logout API so other features keep working
//   function login({ token: newToken, ...userData }) {
//     setToken(newToken);
//     setUser(userData);
//   }

//   function logout() {
//     setToken(null);
//     setUser(null);
//     // Firebase sign-out happens via the token-effect above
//   }

//   return (
//     <AuthContext.Provider value={{ user, login, logout, token }}>
//       {children}
//     </AuthContext.Provider>
//   );
// }

// export function useAuth() {
//   return useContext(AuthContext);
// }

// export default AuthContext;
