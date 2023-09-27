import { useEffect, useMemo, useState } from 'react';

import type { AppAction, AppSubject } from '@open-data-capture/types';
import axios from 'axios';

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
  const { currentUser } = useAuthStore();

  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const isAuthorized = useMemo(() => {
    if (!options.access) {
      return true;
    }
    return Boolean(currentUser?.ability.can(options.access.action, options.access.subject));
  }, [options.access]);

  useEffect(() => {
    if (isAuthorized) {
      setIsLoading(true);
      axios
        .get<T>(resourceURL, {
          params: options.queryParams
        })
        .then((response) => {
          setData(response.data);
        })
        .catch((err) => {
          console.error(`Failed to fetch data for resource: ${resourceURL}`);
          if (options.onError) {
            options.onError(err);
          } else {
            console.error(err);
          }
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setData(null);
    }
  }, [...deps, resourceURL]);

  return { data, setData, isLoading };
}
