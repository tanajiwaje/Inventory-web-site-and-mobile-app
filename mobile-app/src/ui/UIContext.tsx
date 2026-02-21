import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { CompanySettings } from '../types';
import { getPublicCompany } from '../services/public';
import { useAuth } from '../auth/useAuth';

type Toast = {
  id: string;
  message: string;
  type: 'success' | 'info' | 'error';
};

export type NotificationItem = {
  id: string;
  title: string;
  detail: string;
  createdAt: string;
  read: boolean;
};

type UIContextValue = {
  company: CompanySettings | null;
  toast: Toast | null;
  notifications: NotificationItem[];
  unreadCount: number;
  notificationsOpen: boolean;
  showToast: (message: string, type?: Toast['type']) => void;
  addNotification: (title: string, detail: string) => void;
  openNotifications: () => void;
  closeNotifications: () => void;
  markAllRead: () => void;
};

const UIContext = createContext<UIContextValue | undefined>(undefined);

const buildId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

export const UIProvider = ({ children }: { children: React.ReactNode }) => {
  const { token, user } = useAuth();
  const [company, setCompany] = useState<CompanySettings | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      const res = await getPublicCompany();
      if (res) setCompany(res);
    };
    void load();
  }, [token]);

  useEffect(() => {
    if (!token || !user) {
      setNotifications([]);
      return;
    }
    const roleLabel = user.role === 'admin' || user.role === 'super_admin' ? 'Admin' : user.role === 'seller' ? 'Seller' : 'Buyer';
    setNotifications([
      {
        id: buildId(),
        title: 'New order',
        detail: `${roleLabel} workflow has new pending orders.`,
        createdAt: new Date().toISOString(),
        read: false
      },
      {
        id: buildId(),
        title: 'Approval required',
        detail: 'Some transactions are waiting for approval.',
        createdAt: new Date().toISOString(),
        read: false
      },
      {
        id: buildId(),
        title: 'Stock low',
        detail: 'Low stock items detected. Review inventory soon.',
        createdAt: new Date().toISOString(),
        read: true
      },
      {
        id: buildId(),
        title: 'Return requested',
        detail: 'A return request is awaiting action.',
        createdAt: new Date().toISOString(),
        read: true
      }
    ]);
  }, [token, user]);

  const showToast = (message: string, type: Toast['type'] = 'success') => {
    const next: Toast = { id: buildId(), message, type };
    setToast(next);
    setTimeout(() => {
      setToast((current) => (current?.id === next.id ? null : current));
    }, 2200);
  };

  const addNotification = (title: string, detail: string) => {
    setNotifications((prev) => [
      { id: buildId(), title, detail, createdAt: new Date().toISOString(), read: false },
      ...prev
    ]);
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);

  const value = useMemo(
    () => ({
      company,
      toast,
      notifications,
      unreadCount,
      notificationsOpen,
      showToast,
      addNotification,
      openNotifications: () => setNotificationsOpen(true),
      closeNotifications: () => setNotificationsOpen(false),
      markAllRead
    }),
    [company, toast, notifications, unreadCount, notificationsOpen]
  );

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
};

export const useUI = () => {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error('useUI must be used within UIProvider');
  return ctx;
};
