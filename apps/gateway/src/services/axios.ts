import { useNotificationsStore } from '@douglasneuroinformatics/ui';
import axios, { isAxiosError } from 'axios';
import i18next from 'i18next';

axios.interceptors.request.use((config) => {
  config.headers.setAccept('application/json');
  config.timeout = 10000; // abort request after 10 seconds
  config.timeoutErrorMessage = i18next.t('networkError');
  return config;
});

axios.interceptors.response.use(
  (response) => response,
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
