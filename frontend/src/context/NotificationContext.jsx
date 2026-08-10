import { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, AlertTriangle, XCircle, Info, X } from 'lucide-react';

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now().toString() + Math.random().toString();
    setNotifications(prev => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  return (
    <NotificationContext.Provider value={{ addNotification, removeNotification }}>
      {children}
      <div className="fixed top-0 left-0 right-0 z-[100] flex flex-col items-center pointer-events-none p-4 space-y-2">
        {notifications.map((notif) => {
          let Icon = Info;
          let colorClass = 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800';
          if (notif.type === 'success') {
            Icon = CheckCircle;
            colorClass = 'bg-green-50 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800';
          } else if (notif.type === 'warning') {
            Icon = AlertTriangle;
            colorClass = 'bg-yellow-50 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800';
          } else if (notif.type === 'error') {
            Icon = XCircle;
            colorClass = 'bg-red-50 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800';
          }

          return (
            <div 
              key={notif.id} 
              className={`pointer-events-auto flex items-center justify-between shadow-lg max-w-md w-full p-4 rounded-xl border backdrop-blur-md transition-all animate-fade-in-down ${colorClass}`}
            >
              <div className="flex items-center space-x-3">
                <Icon size={20} className="flex-shrink-0" />
                <p className="text-sm font-medium">{notif.message}</p>
              </div>
              <button 
                onClick={() => removeNotification(notif.id)} 
                className="p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition"
              >
                <X size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </NotificationContext.Provider>
  );
};
