import { useNotificationsStore } from '@douglasneuroinformatics/ui/hooks';
import axios, { isAxiosError } from 'axios';
import i18next from 'i18next';

import { config } from '@/config';
import { useAuthStore } from '@/stores/auth-store';

axios.defaults.baseURL = import.meta.env.MODE !== 'test' ? config.setup.apiBaseUrl : undefined;

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
  (response) => {
    if (!import.meta.env.DEV) {
      return response;
    }
    return new Promise((resolve) =>
      setTimeout(() => {
        resolve(response);
      }, config.dev.networkLatency)
    );
  },
  (error) => {
    const notifications = useNotificationsStore.getState();
    if (!isAxiosError(error)) {
      notifications.addNotification({ message: i18next.t('unknownError'), type: 'error' });
      console.error(error);
      return Promise.reject(error);
    }
    notifications.addNotification({
      message: i18next.t('httpRequestFailed'),
      title: error.response?.status.toString(),
      type: 'error'
    });
    return Promise.reject(error);
  }
);

export default axios;
