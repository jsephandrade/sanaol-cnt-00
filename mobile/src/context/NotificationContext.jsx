import React, { createContext, useContext, useMemo, useState } from 'react';

const NotificationContext = createContext(undefined);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = (message, extras = {}) => {
    setNotifications((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        message,
        ...extras,
      },
    ]);
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const value = useMemo(
    () => ({
      notifications,
      addNotification,
      clearNotifications,
    }),
    [notifications]
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      'useNotifications must be used within a NotificationProvider'
    );
  }
  return context;
};
