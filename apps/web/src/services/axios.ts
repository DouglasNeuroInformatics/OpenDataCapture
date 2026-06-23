/* eslint-disable @typescript-eslint/consistent-type-definitions */

import { useNotificationsStore } from '@douglasneuroinformatics/libui/hooks';
import { i18n } from '@douglasneuroinformatics/libui/i18n';
import axios, { isAxiosError } from 'axios';

import { config } from '@/config';
import { useAppStore } from '@/store';

declare module 'axios' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  export interface AxiosRequestConfig<D = any> {
    meta?: {
      disableDefaultAuth?: boolean;
      // Suppress the generic "HTTP Request Failed" toast so a caller can show its own specific error
      // message (e.g. a mutation onError) without the user seeing two notifications.
      disableDefaultErrorNotification?: boolean;
      disableDefaultTimeout?: boolean;
    };
  }
}

axios.defaults.baseURL = config.setup.apiBaseUrl;

axios.interceptors.request.use((config) => {
  const accessToken = useAppStore.getState().accessToken;

  config.headers.setAccept(['application/json', 'application/x-msgpack']);

  // Do not set timeout for setup (can be CPU intensive, especially on slow server)
  if (!config.meta?.disableDefaultTimeout) {
    config.timeout = 10000; // abort request after 10 seconds
    config.timeoutErrorMessage = i18n.t({
      en: 'Network Error',
      fr: 'Erreur de réseau'
    });
  }

  if (accessToken && !config.meta?.disableDefaultAuth) {
    config.headers.set('Authorization', `Bearer ${accessToken}`);
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
    // Let callers that surface their own specific error message opt out of the generic toast.
    if (!error.config?.meta?.disableDefaultErrorNotification) {
      notifications.addNotification({
        message: i18n.t({
          en: 'HTTP Request Failed',
          fr: 'Échec de la requête HTTP'
        }),
        title: error.response?.status.toString(),
        type: 'error'
      });
    }
    return Promise.reject(error);
  }
);
