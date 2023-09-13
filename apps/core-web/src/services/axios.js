import { useNotificationsStore } from '@douglasneuroinformatics/ui';
import axios, { AxiosError } from 'axios';
import { useAuthStore } from '@/stores/auth-store';
axios.defaults.baseURL = '/api';
axios.interceptors.request.use(function (config) {
  var auth = useAuthStore.getState();
  config.headers.setAccept('application/json');
  if (auth.accessToken) {
    config.headers.set('Authorization', 'Bearer '.concat(auth.accessToken));
  }
  return config;
});
axios.interceptors.response.use(
  function (response) {
    return response;
  },
  function (error) {
    var notifications = useNotificationsStore.getState();
    var message = error instanceof Error ? error.message : 'An unknown error occurred';
    notifications.addNotification({
      type: 'error',
      message: message
    });
    if (error instanceof AxiosError) {
      console.error(error.response);
    }
    return Promise.reject(error);
  }
);
export default axios;
