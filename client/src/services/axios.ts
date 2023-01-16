import axios from 'axios';

import { useAuthStore } from '@/features/auth';
import { useNotificationsStore } from '@/features/notifications';

axios.defaults.baseURL = import.meta.env.VITE_API_HOST;

axios.interceptors.request.use((config) => {
  const auth = useAuthStore.getState();

  config.headers = {
    Accept: 'application/json'
  };

  if (auth.accessToken) {
    config.headers['Authorization'] = `Bearer ${auth.accessToken}`;
  }

  return config;
});

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    const notifications = useNotificationsStore.getState();
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    notifications.addNotification({
      type: 'error',
      title: 'Error',
      message
    });

    console.error(error);
    return Promise.reject(error);
  }
);

export default axios;
