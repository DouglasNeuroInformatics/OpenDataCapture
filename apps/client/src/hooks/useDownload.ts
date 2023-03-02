import { useEffect, useState } from 'react';

import { useAuthStore } from '@/stores/auth-store';
import { useNotificationsStore } from '@/stores/notifications-store';

const baseURL = import.meta.env.VITE_API_HOST;

export function useDownload(resourceURL: string) {
  const auth = useAuthStore();
  const notifications = useNotificationsStore();
  const [trigger, setTrigger] = useState(false);

  useEffect(() => {
    if (trigger) {
      const anchor = document.createElement('a');
      document.body.appendChild(anchor);

      fetch(baseURL + resourceURL, {
        headers: {
          Authorization: `Bearer ${auth.accessToken!}`
        }
      })
        .then((response) => {
          if (!response.ok) {
            console.error(response);
            throw new Error(`${response.status}: ${response.statusText}`);
          }
          return response.blob();
        })
        .then((blob) => {
          const objectURL = URL.createObjectURL(blob);
          anchor.href = objectURL;
          anchor.download = 'foo';
          anchor.click();
          URL.revokeObjectURL(objectURL);
        })
        .catch((error) => {
          const message = error instanceof Error ? error.message : 'An unknown error occurred';
          notifications.add({
            type: 'error',
            title: 'Error',
            message
          });
        })
        .finally(() => {
          anchor.remove();
        });
      setTrigger(false);
    }
  }, [trigger]);

  return () => setTrigger(true);
}
