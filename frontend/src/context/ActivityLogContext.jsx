import React, { createContext, useContext, useState, useCallback } from 'react';

const ActivityLogContext = createContext();

export const useActivityLog = () => {
  const context = useContext(ActivityLogContext);
  if (!context) {
    throw new Error('useActivityLog must be used within ActivityLogProvider');
  }
  return context;
};

export const ActivityLogProvider = ({ children }) => {
  const [logs, setLogs] = useState([
    { timestamp: new Date().toLocaleTimeString(), type: 'INFO', msg: 'System initialized' }
  ]);

  const addLog = useCallback((type, message) => {
    const newLog = {
      timestamp: new Date().toLocaleTimeString(),
      type: type.toUpperCase(),
      msg: message
    };
    setLogs(prevLogs => [newLog, ...prevLogs]);
  }, []);

  const logAction = useCallback((action, details = '') => {
    addLog('INFO', `${action}${details ? ': ' + details : ''}`);
  }, [addLog]);

  const logSuccess = useCallback((action, details = '') => {
    addLog('SUCCESS', `${action}${details ? ': ' + details : ''}`);
  }, [addLog]);

  const logError = useCallback((action, error = '') => {
    addLog('ERROR', `${action}${error ? ': ' + error : ''}`);
  }, [addLog]);

  const clearLogs = useCallback(() => {
    setLogs([{ timestamp: new Date().toLocaleTimeString(), type: 'INFO', msg: 'Logs cleared' }]);
  }, []);

  return (
    <ActivityLogContext.Provider value={{ logs, addLog, logAction, logSuccess, logError, clearLogs }}>
      {children}
    </ActivityLogContext.Provider>
  );
};
