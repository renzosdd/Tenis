import React, { createContext, useContext, useState, useEffect } from 'react';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = (message, type = 'info') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ addNotification }}>
      {children}
      <div style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 1000,
        maxWidth: '300px'
      }}>
        {notifications.map(notification => (
          <Notification
            key={notification.id}
            message={notification.message}
            type={notification.type}
            onClose={() => removeNotification(notification.id)}
          />
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

const Notification = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === 'success' ? '#4caf50' : type === 'error' ? '#f44336' : '#2196f3';

  return (
    <div style={{
      backgroundColor: bgColor,
      color: 'white',
      padding: '10px 20px',
      marginBottom: '10px',
      borderRadius: '5px',
      boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <span>{message}</span>
      <button
        onClick={onClose}
        style={{
          background: 'none',
          border: 'none',
          color: 'white',
          cursor: 'pointer',
          fontSize: '16px'
        }}
      >
        ×
      </button>
    </div>
  );
};

export const useNotification = () => useContext(NotificationContext);