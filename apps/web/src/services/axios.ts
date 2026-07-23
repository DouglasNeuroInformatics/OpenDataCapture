/* eslint-disable @typescript-eslint/consistent-type-definitions */

import { useNotificationsStore } from '@douglasneuroinformatics/libui/hooks';
import { i18n } from '@douglasneuroinformatics/libui/i18n';
import axios, { isAxiosError } from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';

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
      // Opt a request out of the automatic transient-failure retry (still applies only to idempotent methods).
      disableRetry?: boolean;
    };
    // Internal: number of transient-failure retries already attempted for this request.
    retryCount?: number;
    // Internal: timestamp (ms) of the first transient failure, used to bound total retry patience.
    retryStartedAt?: number;
  }
}

// The hospital network in front of the API intermittently drops connections (connection resets, DNS
// changes) and returns gateway errors (502/503/504) even when the backend is healthy. To avoid surfacing
// these transient blips to users, we retry idempotent requests with exponential backoff, waiting for the
// browser to come back online, until an overall time budget is exhausted.
const RETRY_BUDGET_MS = 15_000; // ~15s of patience before giving up and surfacing an error
const BASE_RETRY_DELAY_MS = 250;
const MAX_RETRY_DELAY_MS = 2000;
const MAX_OFFLINE_WAIT_MS = 15_000; // longest we block a single retry step waiting for the `online` event
const RETRYABLE_STATUS_CODES = new Set([502, 503, 504]);
const IDEMPOTENT_METHODS = new Set(['get', 'head', 'options']);

axios.defaults.baseURL = config.setup.apiBaseUrl;

/**
 * A transient error is one that is likely to succeed on a later attempt: a dropped/refused/reset
 * connection, a timeout (no response received), or an upstream gateway error. A "real" application error
 * (4xx, or a 5xx the server deliberately returned with a body) is not transient.
 */
function isTransientError(error: unknown): boolean {
  if (!isAxiosError(error)) {
    return false;
  }
  if (!error.response) {
    // No response at all: network failure (ERR_NETWORK), connection reset, or timeout (ECONNABORTED).
    return true;
  }
  return RETRYABLE_STATUS_CODES.has(error.response.status);
}

/** Only idempotent methods are safe to retry automatically — retrying a write risks duplicate submissions. */
function isRetryable(requestConfig: InternalAxiosRequestConfig, error: unknown): boolean {
  if (requestConfig.meta?.disableRetry) {
    return false;
  }
  const method = requestConfig.method?.toLowerCase();
  if (!method || !IDEMPOTENT_METHODS.has(method)) {
    return false;
  }
  return isTransientError(error);
}

/** Exponential backoff with full jitter, capped, to avoid hammering an already-struggling network. */
function getRetryDelay(retryCount: number): number {
  const exponential = Math.min(MAX_RETRY_DELAY_MS, BASE_RETRY_DELAY_MS * 2 ** retryCount);
  return Math.random() * exponential;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Resolve once the browser reports it is back online, or after `timeout` ms, whichever comes first. */
function waitForOnline(timeout: number): Promise<void> {
  if (typeof navigator === 'undefined' || navigator.onLine) {
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    const cleanup = () => {
      window.removeEventListener('online', handleOnline);
      clearTimeout(timer);
    };
    const handleOnline = () => {
      cleanup();
      resolve();
    };
    const timer = setTimeout(() => {
      cleanup();
      resolve();
    }, timeout);
    window.addEventListener('online', handleOnline);
  });
}

// Reflect the browser's connectivity in the store so the UI (banner, recovery screen) can react.
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => useAppStore.getState().setIsOnline(true));
  window.addEventListener('offline', () => useAppStore.getState().setIsOnline(false));
}

axios.interceptors.request.use((config) => {
  const accessToken = useAppStore.getState().accessToken;

  config.headers.setAccept(['application/json', 'application/x-msgpack']);

  // Do not set timeout for setup (can be CPU intensive, especially on slow server)
  if (!config.meta?.disableDefaultTimeout) {
    config.timeout = 10000; // abort request after 10 seconds
    config.timeoutErrorMessage = i18n.t({
      en: 'Network Error',
      es: 'Error de red',
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
  async (error) => {
    const requestConfig = isAxiosError(error) ? error.config : undefined;

    // Retry transient failures on idempotent requests before showing anything to the user. We keep
    // retrying (waiting out offline periods) until the overall time budget is exhausted.
    if (requestConfig && isRetryable(requestConfig, error)) {
      requestConfig.retryStartedAt ??= Date.now();
      const remainingBudget = RETRY_BUDGET_MS - (Date.now() - requestConfig.retryStartedAt);
      if (remainingBudget > 0) {
        const retryCount = requestConfig.retryCount ?? 0;
        requestConfig.retryCount = retryCount + 1;
        const store = useAppStore.getState();
        store.beginRetry();
        try {
          await waitForOnline(Math.min(remainingBudget, MAX_OFFLINE_WAIT_MS));
          await sleep(
            Math.min(
              getRetryDelay(retryCount),
              Math.max(0, RETRY_BUDGET_MS - (Date.now() - requestConfig.retryStartedAt))
            )
          );
          return await axios(requestConfig);
        } finally {
          store.endRetry();
        }
      }
    }

    if (isAxiosError(error) && error.config?.meta?.disableDefaultErrorNotification) {
      return Promise.reject(error);
    }
    const notifications = useNotificationsStore.getState();
    if (!isAxiosError(error)) {
      notifications.addNotification({
        message: i18n.t({
          en: 'Unknown Error',
          es: 'Error desconocido',
          fr: 'Erreur inconnue'
        }),
        type: 'error'
      });
      console.error(error);
      return Promise.reject(error as Error);
    }
    // For transient failures we could not recover from (retries exhausted, or a write we won't auto-retry),
    // show a calm connection message rather than a raw gateway status code, which only confuses users.
    if (isTransientError(error)) {
      notifications.addNotification({
        message: i18n.t({
          en: 'Unable to reach the server. Please check your connection and try again.',
          es: 'No se pudo conectar con el servidor. Por favor, verifique su conexión e intente de nuevo.',
          fr: 'Impossible de joindre le serveur. Veuillez vérifier votre connexion et réessayer.'
        }),
        title: i18n.t({
          en: 'Connection Problem',
          es: 'Problema de conexión',
          fr: 'Problème de connexion'
        }),
        type: 'warning'
      });
      return Promise.reject(error);
    }
    notifications.addNotification({
      message: i18n.t({
        en: 'HTTP Request Failed',
        es: 'Error en la solicitud HTTP',
        fr: 'Échec de la requête HTTP'
      }),
      title: error.response?.status.toString(),
      type: 'error'
    });
    return Promise.reject(error);
  }
);

export { isTransientError };
