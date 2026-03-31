import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '../services/notification';
import { useAuth } from './AuthContext';
import { socketService } from '../services/socket';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  actionUrl?: string;
  isRead: boolean;
  createdAt: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  refetch: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, user } = useAuth();
  const queryClient = useQueryClient();
  const [realTimeNotifications, setRealTimeNotifications] = useState<Notification[]>([]);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationService.getNotifications(),
    enabled: isAuthenticated,
    refetchInterval: 30000,
  });

  useEffect(() => {
    if (isAuthenticated && user) {
      socketService.connect();
      socketService.joinUserRoom(user.id);

      socketService.onNotification((notification: Notification) => {
        setRealTimeNotifications((prev) => [notification, ...prev]);
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
      });

      socketService.onUnreadCount((count: number) => {
        queryClient.setQueryData(['notifications'], (old: any) => ({
          ...old,
          unreadCount: count,
        }));
      });

      return () => {
        socketService.disconnect();
      };
    }
  }, [isAuthenticated, user, queryClient]);

  const markAsReadMutation = useMutation({
    mutationFn: notificationService.markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: notificationService.markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: notificationService.deleteNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const allNotifications = [...realTimeNotifications, ...(data?.notifications || [])];
  const uniqueNotifications = allNotifications.filter(
    (notification, index, self) =>
      index === self.findIndex((n) => n.id === notification.id)
  );

  const value = {
    notifications: uniqueNotifications,
    unreadCount: data?.unreadCount || 0,
    isLoading,
    markAsRead: markAsReadMutation.mutateAsync,
    markAllAsRead: markAllAsReadMutation.mutateAsync,
    deleteNotification: deleteNotificationMutation.mutateAsync,
    refetch,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
