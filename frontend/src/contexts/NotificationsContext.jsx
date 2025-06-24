// import React, { createContext, useContext, useState, useEffect } from 'react';

// const NotificationsContext = createContext();

// export function useNotifications() {
//   return useContext(NotificationsContext);
// }

// export function NotificationsProvider({ children }) {
//   const [notifications, setNotifications] = useState([]);

//   // ask for permission on first load
//   useEffect(() => {
//     if (Notification.permission === 'default') {
//       Notification.requestPermission();
//     }
//   }, []);

//   const addNotification = ({ title, body }) => {
//     const id = Date.now();
//     setNotifications(n => [{ id, title, body }, ...n]);

//     if (Notification.permission === 'granted') {
//       new Notification(title, { body });
//     }
//   };

//   return (
//     <NotificationsContext.Provider value={{ notifications, addNotification }}>
//       {children}
//     </NotificationsContext.Provider>
//   );
// }

import React, { createContext, useContext, useState, useEffect } from 'react';

const NotificationsContext = createContext();

export function useNotifications() {
  return useContext(NotificationsContext);
}

export function NotificationsProvider({ children }) {
  const [notifications, setNotifications] = useState([]);

  // ask for permission on first load
  useEffect(() => {
    // FIX 1: Check if the Notification API exists before trying to use it.
    if ('Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }
  }, []);

  const addNotification = ({ title, body }) => {
    const id = Date.now();
    setNotifications(n => [{ id, title, body }, ...n]);

    // FIX 2: Add the same check here before trying to create a notification.
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body });
    }
  };

  return (
    <NotificationsContext.Provider value={{ notifications, addNotification }}>
      {children}
    </NotificationsContext.Provider>
  );
}
