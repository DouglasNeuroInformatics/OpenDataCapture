import { nanoid } from 'nanoid';
import { create } from 'zustand';

export interface Notification {
  id: string;
  type: 'info' | 'warning' | 'success' | 'error';
  title?: string;
  message?: string;
  variant?: 'critical' | 'standard';
}

export interface NotificationsStore {
  notifications: Notification[];
  add: (notification: Omit<Notification, 'id'>) => void;
  dismiss: (id: string) => void;
}

export const useNotificationsStore = create<NotificationsStore>((set) => ({
  notifications: [],
  add: (notification) =>
    set((state) => ({
      notifications: [...state.notifications, { id: nanoid(), ...notification }]
    })),
  dismiss: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((notification) => notification.id !== id)
    }))
}));
