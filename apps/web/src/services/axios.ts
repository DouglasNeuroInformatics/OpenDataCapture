import { useNotificationsStore } from '@douglasneuroinformatics/ui';
import axios, { AxiosError } from 'axios';
import i18next from 'i18next';

import { useAuthStore } from '@/stores/auth-store';

axios.defaults.baseURL = '/api';

axios.interceptors.request.use((config) => {
  const auth = useAuthStore.getState();

  config.headers.setAccept('application/json');
  config.timeout = 5000; // abort request after 5 seconds
  config.timeoutErrorMessage = i18next.t('networkError');

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
    notifications.addNotification({
      type: 'error',
      message
    });

    if (error instanceof AxiosError) {
      console.error(error.response);
    }

    return Promise.reject(error);
  }
);

export default axios;
