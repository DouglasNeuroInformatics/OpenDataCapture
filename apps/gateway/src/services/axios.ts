import { useNotificationsStore } from '@douglasneuroinformatics/libui/hooks';
import { i18n } from '@douglasneuroinformatics/libui/i18n';
import axios, { isAxiosError } from 'axios';

axios.interceptors.request.use((config) => {
  config.headers.setAccept('application/json');
  config.timeout = 10000; // abort request after 10 seconds
  config.timeoutErrorMessage = i18n.t({
    en: 'Network Error',
    fr: 'Erreur de réseau'
  });
  return config;
});

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    const notifications = useNotificationsStore.getState();
    if (!isAxiosError(error)) {
      notifications.addNotification({
        message: i18n.t({
          en: 'Unknown Error',
          fr: 'Erreur inconnue'
        }),
        type: 'error'
      });
      console.error(error);
      return Promise.reject(error as Error);
    }
    notifications.addNotification({
      message: i18n.t({
        en: 'HTTP Request Failed',
        fr: 'Échec de la requête HTTP'
      }),
      title: error.response?.status.toString(),
      type: 'error'
    });
    return Promise.reject(error);
  }
);

export default axios;
