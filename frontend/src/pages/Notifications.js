import React from 'react';
import { useNotifications } from '../contexts/NotificationsContext';
import './Notifications.css';

export default function Notifications() {
  const { notifications } = useNotifications();

  return (
    <div className="notifications-container">
      <h1>Notifications</h1>
      {notifications.length === 0 ? (
        <p>No notifications yet.</p>
      ) : (
        notifications.map(n => (
          <div className="notification-item" key={n.id}>
            <p className="notification-title">{n.title}</p>
            <p className="notification-body">{n.body}</p>
          </div>
        ))
      )}
    </div>
  );
}
