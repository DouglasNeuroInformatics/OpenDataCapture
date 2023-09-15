import { useEffect, useMemo, useState } from 'react';

import { useNotificationsStore } from '@douglasneuroinformatics/ui';
import { AppAction, AppSubject } from '@open-data-capture/types';

import { useAuthStore } from '@/stores/auth-store';

export type UseFetchOptions = {
  /** The required ability to fetch the resource. If undefined, it is assumed the user has the required permissions. If the user does not have the provided ability, data will be set to `null` */
  access?: {
    action: AppAction;
    subject: AppSubject;
  };
  /** a callback to override the default error handler which is to add a notification */
  onError?: (error: unknown) => void;

  /** Query params to add to the URL */
  queryParams?: Record<string, string | null | undefined>;
};

export type UseFetchReturn<T> = {
  data: T | null;
  setData: React.Dispatch<React.SetStateAction<T | null>>;
  isLoading: boolean;
};

/**
 * Common hook used throughout the application to request data from our API. The
 * base URL used for requests is set in the Vite config.
 * @param resourceURL - the url of the resource to require (e.g., /users), or null to skip fetching
 * @param deps - an optional list of dependencies to trigger a refetch
 * @param options - an object of type `UseFetchOptions`
 * @returns
 */
export function useFetch<T = unknown>(
  resourceURL: string,
  deps: readonly unknown[] = [],
  options: UseFetchOptions = {}
): UseFetchReturn<T> {
  const { accessToken, currentUser } = useAuthStore();
  const notifications = useNotificationsStore();

  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const baseURL = `${window.location.origin}/api`;

  const url = useMemo(() => {
    const url = new URL(baseURL + resourceURL);
    for (const key in options.queryParams) {
      if (options.queryParams[key]) {
        url.searchParams.append(key, options.queryParams[key]!);
      }
    }
    return url;
  }, [baseURL, resourceURL, options.queryParams]);

  const isAuthorized = useMemo(() => {
    if (!options.access) {
      return true;
    }
    return Boolean(currentUser?.ability.can(options.access.action, options.access.subject));
  }, [options.access]);

  const setError = (error: unknown) => {
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    notifications.addNotification({
      type: 'error',
      message
    });
  };

  useEffect(() => {
    if (isAuthorized) {
      setIsLoading(true);
      fetch(url, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${accessToken!}`
        }
      })
        .then((response) => {
          if (!response.ok) {
            console.error(response);
            throw new Error(`${response.status}: ${response.statusText}`);
          }
          return response.json();
        })
        .then((data: T) => {
          setData(data);
        })
        .catch(options.onError ?? setError)
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setData(null);
    }
  }, [...deps, url.href]);

  return { data, setData, isLoading };
}
