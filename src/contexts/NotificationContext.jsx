import React, { createContext, useContext, useState } from 'react';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = (message, type) => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), 3000);
  };

  return (
    <NotificationContext.Provider value={{ notifications, addNotification }}>
      <div>
        {notifications.map(n => (
          <div key={n.id} className={`toast ${n.type === 'error' ? 'red' : 'green'} lighten-2 white-text`} style={{ position: 'fixed', top: '10px', right: '10px', zIndex: 1000 }}>
            {n.message}
          </div>
        ))}
        {children}
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);