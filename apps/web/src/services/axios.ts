import { useNotificationsStore } from '@douglasneuroinformatics/ui';
import axios from 'axios';
import i18next from 'i18next';

import { useAuthStore } from '@/stores/auth-store';

axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL;

axios.interceptors.request.use((config) => {
  const auth = useAuthStore.getState();
  
  config.headers.setAccept('application/json');

  // Do not set timeout for setup (can be CPU intensive, especially on slow server)
  if (config.url !== '/v1/setup') {
    config.timeout = 10000; // abort request after 10 seconds
    config.timeoutErrorMessage = i18next.t('networkError');
  }

  if (auth.accessToken) {
    config.headers.set('Authorization', `Bearer ${auth.accessToken}`);
  }

  return config;
});

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    const notifications = useNotificationsStore.getState();
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    notifications.addNotification({ type: 'error', message });
    return Promise.reject(error);
  }
);

export default axios;
