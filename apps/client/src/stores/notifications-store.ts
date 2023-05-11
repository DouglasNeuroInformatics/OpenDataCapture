import { create } from 'zustand';

export interface Notification {
  id: number;
  type: 'info' | 'warning' | 'success' | 'error';
  title?: string;
  message?: string;
  variant?: 'critical' | 'standard';
}

export interface NotificationsStore {
  notifications: Notification[];
  add: (notification: Omit<Notification, 'id'>) => void;
  dismiss: (id: number) => void;
}

export const useNotificationsStore = create<NotificationsStore>((set) => ({
  notifications: [],
  add: (notification) =>
    set((state) => ({
      notifications: [...state.notifications, { id: Date.now(), ...notification }]
    })),
  dismiss: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((notification) => notification.id !== id)
    }))
}));
