import { useState, useCallback } from 'react';
import { Notification } from '@/types/models';
import * as storage from '@/services/storage';

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>(storage.getNotifications());

  const refresh = useCallback(() => setNotifications(storage.getNotifications()), []);

  const add = useCallback((n: Omit<Notification, 'id' | 'createdAt' | 'read'>) => {
    const newN = storage.addNotification(n);
    refresh();
    return newN;
  }, [refresh]);

  const markRead = useCallback((id: string) => {
    storage.markNotificationRead(id);
    refresh();
  }, [refresh]);

  const markAllRead = useCallback(() => {
    storage.markAllNotificationsRead();
    refresh();
  }, [refresh]);

  const remove = useCallback((id: string) => {
    storage.deleteNotification(id);
    refresh();
  }, [refresh]);

  const unreadCount = notifications.filter(n => !n.read).length;

  return { notifications, add, markRead, markAllRead, remove, refresh, unreadCount };
}
