import { useState, useCallback, useEffect } from 'react';
import { Notification } from '@/types/models';
import * as database from '@/services/database';

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const data = await database.getNotifications();
    setNotifications(data);
    setLoading(false);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const add = useCallback(async (n: Omit<Notification, 'id' | 'createdAt' | 'read'>) => {
    const newN = await database.addNotification(n);
    await refresh();
    return newN;
  }, [refresh]);

  const markRead = useCallback(async (id: string) => {
    await database.markNotificationRead(id);
    await refresh();
  }, [refresh]);

  const markAllRead = useCallback(async () => {
    await database.markAllNotificationsRead();
    await refresh();
  }, [refresh]);

  const remove = useCallback(async (id: string) => {
    await database.deleteNotification(id);
    await refresh();
  }, [refresh]);

  const unreadCount = notifications.filter(n => !n.read).length;

  return { notifications, loading, add, markRead, markAllRead, remove, refresh, unreadCount };
}
