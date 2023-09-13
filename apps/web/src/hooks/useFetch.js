var __spreadArray =
  (this && this.__spreadArray) ||
  function (to, from, pack) {
    if (pack || arguments.length === 2)
      for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
          if (!ar) ar = Array.prototype.slice.call(from, 0, i);
          ar[i] = from[i];
        }
      }
    return to.concat(ar || Array.prototype.slice.call(from));
  };
import { useEffect, useMemo, useState } from 'react';
import { useNotificationsStore } from '@douglasneuroinformatics/ui';
import { useAuthStore } from '@/stores/auth-store';
/**
 * Common hook used throughout the application to request data from our API. The
 * base URL used for requests is set in the Vite config.
 * @param resourceURL - the url of the resource to require (e.g., /users), or null to skip fetching
 * @param deps - an optional list of dependencies to trigger a refetch
 * @param options - an object of type `UseFetchOptions`
 * @returns
 */
export function useFetch(resourceURL, deps, options) {
  if (deps === void 0) {
    deps = [];
  }
  if (options === void 0) {
    options = {};
  }
  var _a = useAuthStore(),
    accessToken = _a.accessToken,
    currentUser = _a.currentUser;
  var notifications = useNotificationsStore();
  var _b = useState(null),
    data = _b[0],
    setData = _b[1];
  var _c = useState(false),
    isLoading = _c[0],
    setIsLoading = _c[1];
  var baseURL = ''.concat(window.location.origin, '/api');
  var url = useMemo(
    function () {
      var url = new URL(baseURL + resourceURL);
      for (var key in options.queryParams) {
        if (options.queryParams[key]) {
          url.searchParams.append(key, options.queryParams[key]);
        }
      }
      return url;
    },
    [baseURL, resourceURL, options.queryParams]
  );
  var isAuthorized = useMemo(
    function () {
      if (!options.access) {
        return true;
      }
      return Boolean(
        currentUser === null || currentUser === void 0
          ? void 0
          : currentUser.ability.can(options.access.action, options.access.subject)
      );
    },
    [options.access]
  );
  var setError = function (error) {
    var message = error instanceof Error ? error.message : 'An unknown error occurred';
    notifications.addNotification({
      type: 'error',
      message: message
    });
  };
  useEffect(
    function () {
      var _a;
      if (isAuthorized) {
        setIsLoading(true);
        fetch(url, {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            Authorization: 'Bearer '.concat(accessToken)
          }
        })
          .then(function (response) {
            if (!response.ok) {
              console.error(response);
              throw new Error(''.concat(response.status, ': ').concat(response.statusText));
            }
            return response.json();
          })
          .then(function (data) {
            setData(data);
          })
          .catch((_a = options.onError) !== null && _a !== void 0 ? _a : setError)
          .finally(function () {
            setIsLoading(false);
          });
      } else {
        setData(null);
      }
    },
    __spreadArray(__spreadArray([], deps, true), [url.href], false)
  );
  return { data: data, setData: setData, isLoading: isLoading };
}
