import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  duration?: number;
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (type: NotificationType, message: string, duration?: number) => void;
  removeNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const timeoutsRef = React.useRef<Map<string, NodeJS.Timeout>>(new Map());

  const addNotification = useCallback((type: NotificationType, message: string, duration: number = 5000) => {
    const id = Math.random().toString(36).substring(7);
    setNotifications(prev => [...prev, { id, type, message, duration }]);

    if (duration > 0) {
      const timeoutId = setTimeout(() => {
        removeNotification(id);
      }, duration);
      timeoutsRef.current.set(id, timeoutId);
    }
  }, []);

  const removeNotification = useCallback((id: string) => {
    // Clear timeout if it exists
    const timeoutId = timeoutsRef.current.get(id);
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutsRef.current.delete(id);
    }
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(timeoutId => clearTimeout(timeoutId));
      timeoutsRef.current.clear();
    };
  }, []);

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, removeNotification }}>
      {children}
      <NotificationContainer notifications={notifications} onClose={removeNotification} />
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
};

interface NotificationContainerProps {
  notifications: Notification[];
  onClose: (id: string) => void;
}

const NotificationContainer: React.FC<NotificationContainerProps> = ({ notifications, onClose }) => {
  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[100] space-y-2 max-w-sm">
      {notifications.map(notification => (
        <NotificationToast
          key={notification.id}
          notification={notification}
          onClose={() => onClose(notification.id)}
        />
      ))}
    </div>
  );
};

interface NotificationToastProps {
  notification: Notification;
  onClose: () => void;
}

const NotificationToast: React.FC<NotificationToastProps> = ({ notification, onClose }) => {
  const icons = {
    success: <CheckCircle className="text-success" size={20} />,
    error: <AlertCircle className="text-error" size={20} />,
    info: <Info className="text-primary" size={20} />,
    warning: <AlertCircle className="text-warning" size={20} />,
  };

  const bgColors = {
    success: 'bg-success/10 border-success/30',
    error: 'bg-error/10 border-error/30',
    info: 'bg-primary/10 border-primary/30',
    warning: 'bg-warning/10 border-warning/30',
  };

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-lg border ${bgColors[notification.type]} bg-surface-primary backdrop-blur-sm shadow-lg animate-slide-in-right`}
    >
      <div className="flex-shrink-0 mt-0.5">{icons[notification.type]}</div>
      <div className="flex-1 text-sm text-foreground">{notification.message}</div>
      <button
        onClick={onClose}
        className="flex-shrink-0 text-muted hover:text-foreground transition-colors"
      >
        <X size={16} />
      </button>
    </div>
  );
};
