import { useEffect, useState } from 'react';

import { useAuthStore } from '@/stores/auth-store';
import { useNotificationsStore } from '@/stores/notifications-store';

const baseURL = import.meta.env.VITE_API_HOST;

/**
 * Common hook used throughout the application to request data from our API. The
 * base URL used for requests is set in the Vite config.
 * @param resourceURL - the url of the resource to require (e.g., /users)
 * @param deps - an optional list of dependencies to trigger a refetch
 * @param onError - a callback to override the default error handler which is to add a notification
 * @returns
 */
export function useFetch<T = unknown>(
  resourceURL: string,
  deps: readonly unknown[] = [],
  onError?: (error: unknown) => void
): {
  data: T | null;
  setData: React.Dispatch<React.SetStateAction<T | null>>;
} {
  const auth = useAuthStore();
  const notifications = useNotificationsStore();

  const [data, setData] = useState<T | null>(null);

  const setError = (error: unknown) => {
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    notifications.add({
      type: 'error',
      message
    });
  };

  useEffect(() => {
    fetch(baseURL + resourceURL, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${auth.accessToken!}`
      }
    })
      .then((response) => {
        if (!response.ok) {
          console.error(response);
          throw new Error(`${response.status}: ${response.statusText}`);
        }
        return response.json();
      })
      .then((data: T) => setData(data))
      .catch(onError ?? setError);
  }, deps);

  return { data, setData };
}
