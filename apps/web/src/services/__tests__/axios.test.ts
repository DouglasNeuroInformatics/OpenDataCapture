import { useNotificationsStore } from '@douglasneuroinformatics/libui/hooks';
import { i18n } from '@douglasneuroinformatics/libui/i18n';
import axios, { AxiosError, AxiosHeaders } from 'axios';
import type { AxiosAdapter, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Mock } from 'vitest';

import * as axiosModule from '@/services/axios';

import '@/services/i18n';

type StoreFixture = {
  accessToken: null | string;
  beginRetry: Mock;
  endRetry: Mock;
  requireReauthentication: Mock;
  setIsOnline: Mock;
};

type StoreListener = (state: StoreFixture) => void;

const store = vi.hoisted((): StoreFixture => ({
  accessToken: null,
  beginRetry: vi.fn(),
  endRetry: vi.fn(),
  requireReauthentication: vi.fn(),
  setIsOnline: vi.fn()
}));

const storeListeners = vi.hoisted(() => new Set<StoreListener>());

vi.mock('@/store', () => ({
  useAppStore: {
    getState: () => store,
    subscribe: (listener: StoreListener) => {
      storeListeners.add(listener);
      return () => storeListeners.delete(listener);
    }
  }
}));

vi.mock('@/config', () => ({
  config: {
    dev: { networkLatency: 500 },
    setup: { apiBaseUrl: 'https://api.example.org' }
  }
}));

const createResponse = (config: InternalAxiosRequestConfig, status: number): AxiosResponse => ({
  config,
  data: null,
  headers: {},
  status,
  statusText: ''
});

const createError = (config: InternalAxiosRequestConfig, status?: number) => {
  return new AxiosError(
    'Request failed',
    status ? AxiosError.ERR_BAD_RESPONSE : AxiosError.ERR_NETWORK,
    config,
    null,
    status ? createResponse(config, status) : undefined
  );
};

/** An adapter that answers each call with the next outcome: a status to respond with, or an error to reject with. */
const createAdapter = (...outcomes: ({ fail?: number | true } | { status: number })[]) => {
  const queue = [...outcomes];
  return vi.fn<AxiosAdapter>((config) => {
    const outcome = queue.shift() ?? { status: 200 };
    if ('status' in outcome) {
      return Promise.resolve(createResponse(config, outcome.status));
    }
    return Promise.reject(createError(config, outcome.fail === true ? undefined : outcome.fail));
  });
};

const getNotifications = () => useNotificationsStore.getState().notifications;

const notifyStoreListeners = () => {
  for (const listener of [...storeListeners]) {
    listener(store);
  }
};

const signInAgainWith = (accessToken: string) => {
  store.accessToken = accessToken;
  notifyStoreListeners();
};

const flushTask = () => {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, 0);
  });
};

const waitUntilPasswordIsRequired = () => {
  return vi.waitFor(() => expect(store.requireReauthentication).toHaveBeenCalledOnce());
};

describe('axios', () => {
  beforeEach(() => {
    i18n.changeLanguage('en');
    vi.stubEnv('DEV', false);
    vi.spyOn(Math, 'random').mockReturnValue(0);
    store.accessToken = null;
    storeListeners.clear();
    useNotificationsStore.setState({ notifications: [] });
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  describe('requests', () => {
    it('should send requests to the configured API', () => {
      expect(axios.defaults.baseURL).toBe('https://api.example.org');
    });

    it('should accept both JSON and MessagePack responses', async () => {
      const adapter = createAdapter();
      await axios.get('/v1/subjects', { adapter });
      expect(adapter.mock.lastCall?.[0].headers.getAccept()).toEqual(['application/json', 'application/x-msgpack']);
    });

    it('should abort a request after ten seconds with a translated message', async () => {
      i18n.changeLanguage('fr');
      const adapter = createAdapter();
      await axios.get('/v1/subjects', { adapter });
      expect(adapter.mock.lastCall?.[0]).toMatchObject({ timeout: 10_000, timeoutErrorMessage: 'Erreur de réseau' });
    });

    it('should not time out a request that opts out, since setup can be CPU intensive', async () => {
      const adapter = createAdapter();
      await axios.post('/v1/setup', {}, { adapter, meta: { disableDefaultTimeout: true } });
      expect(adapter.mock.lastCall?.[0].timeout).toBe(0);
      expect(adapter.mock.lastCall?.[0].timeoutErrorMessage).toBeUndefined();
    });

    it('should authorize requests with the access token of the signed-in user', async () => {
      store.accessToken = 'token';
      const adapter = createAdapter();
      await axios.get('/v1/subjects', { adapter });
      expect(adapter.mock.lastCall?.[0].headers.getAuthorization()).toBe('Bearer token');
    });

    it('should not authorize requests when no user is signed in', async () => {
      const adapter = createAdapter();
      await axios.get('/v1/setup', { adapter });
      expect(adapter.mock.lastCall?.[0].headers.has('Authorization')).toBe(false);
    });

    it('should not authorize a request that opts out of the default auth', async () => {
      store.accessToken = 'token';
      const adapter = createAdapter();
      await axios.get('/v1/setup', { adapter, meta: { disableDefaultAuth: true } });
      expect(adapter.mock.lastCall?.[0].headers.has('Authorization')).toBe(false);
    });
  });

  describe('responses', () => {
    it('should return responses immediately outside development', async () => {
      const response = await axios.get('/v1/subjects', { adapter: createAdapter() });
      expect(response.status).toBe(200);
    });

    it('should delay responses by the simulated network latency in development', async () => {
      vi.stubEnv('DEV', true);
      vi.useFakeTimers();
      const onResolved = vi.fn();
      void axios.get('/v1/subjects', { adapter: createAdapter() }).then(onResolved);
      await vi.advanceTimersByTimeAsync(499);
      expect(onResolved).not.toHaveBeenCalled();
      await vi.advanceTimersByTimeAsync(1);
      expect(onResolved).toHaveBeenCalledOnce();
    });
  });

  describe('reauthentication', () => {
    it('should hold a request refused for an expired token and send it again once the user has signed in again', async () => {
      store.accessToken = 'expired';
      const adapter = createAdapter({ fail: 401 }, { status: 200 });
      const request = axios.post('/v1/instrument-records', {}, { adapter });
      await waitUntilPasswordIsRequired();
      signInAgainWith('fresh');
      expect((await request).status).toBe(200);
      expect(adapter.mock.lastCall?.[0].headers.getAuthorization()).toBe('Bearer fresh');
    });

    it('should keep holding the request while the store changes for some other reason', async () => {
      store.accessToken = 'expired';
      const adapter = createAdapter({ fail: 401 }, { status: 200 });
      const onSettled = vi.fn();
      void axios.get('/v1/subjects', { adapter }).finally(onSettled);
      await waitUntilPasswordIsRequired();
      notifyStoreListeners();
      // A released request reaches the adapter several microtasks later, so a whole task is let pass.
      await flushTask();
      expect(adapter).toHaveBeenCalledOnce();
      expect(onSettled).not.toHaveBeenCalled();
      // The same wait is enough for a request that is released, so the lines above prove it was held.
      signInAgainWith('fresh');
      await flushTask();
      expect(adapter).toHaveBeenCalledTimes(2);
      expect(onSettled).toHaveBeenCalledOnce();
    });

    it('should show no error for a held request, since the password dialog already says what happened', async () => {
      store.accessToken = 'expired';
      const request = axios.get('/v1/subjects', { adapter: createAdapter({ fail: 401 }, { status: 200 }) });
      await waitUntilPasswordIsRequired();
      signInAgainWith('fresh');
      await request;
      expect(getNotifications()).toHaveLength(0);
    });

    it('should give a request it sends again its full patience for a network blip, however long it was held', async () => {
      const now = vi.spyOn(Date, 'now').mockReturnValue(0);
      store.accessToken = 'expired';
      const adapter = createAdapter({ fail: 503 }, { fail: 401 }, { fail: 503 }, { status: 200 });
      const request = axios.get('/v1/subjects', { adapter });
      await waitUntilPasswordIsRequired();
      // Long past the fifteen seconds a retried request is given, counted from its first failure.
      now.mockReturnValue(60_000);
      signInAgainWith('fresh');
      expect((await request).status).toBe(200);
      expect(adapter).toHaveBeenCalledTimes(4);
    });

    it('should send a request again at once when the token was renewed while it was in flight', async () => {
      store.accessToken = 'superseded';
      const adapter = vi.fn<AxiosAdapter>((config) => {
        if (store.accessToken === 'superseded') {
          store.accessToken = 'renewed';
          return Promise.reject(createError(config, 401));
        }
        return Promise.resolve(createResponse(config, 200));
      });
      await axios.get('/v1/subjects', { adapter });
      expect(store.requireReauthentication).not.toHaveBeenCalled();
      expect(adapter.mock.lastCall?.[0].headers.getAuthorization()).toBe('Bearer renewed');
    });

    it('should reject a 401 for a request sent without a token, such as a wrong password at login', async () => {
      const request = axios.post('/v1/auth/login', {}, { adapter: createAdapter({ fail: 401 }) });
      await expect(request).rejects.toMatchObject({ response: { status: 401 } });
      expect(store.requireReauthentication).not.toHaveBeenCalled();
    });

    it('should reject a 401 for a request that opts out, which is how renewal learns it was refused', async () => {
      store.accessToken = 'expired';
      const request = axios.post('/v1/auth/refresh', undefined, {
        adapter: createAdapter({ fail: 401 }),
        meta: { disableDefaultReauthentication: true }
      });
      await expect(request).rejects.toMatchObject({ response: { status: 401 } });
      expect(store.requireReauthentication).not.toHaveBeenCalled();
    });

    describe('while an instrument fills the screen', () => {
      const exitFullscreen = vi.fn<() => Promise<void>>();

      // happy-dom implements neither half of the Fullscreen API.
      beforeEach(() => {
        exitFullscreen.mockResolvedValue(undefined);
        Object.defineProperty(document, 'fullscreenElement', { configurable: true, value: document.body });
        document.exitFullscreen = exitFullscreen;
        store.accessToken = 'expired';
      });

      afterEach(() => {
        Reflect.deleteProperty(document, 'fullscreenElement');
        Reflect.deleteProperty(document, 'exitFullscreen');
      });

      it('should leave fullscreen before asking for the password, since the dialog cannot be seen over it', async () => {
        void axios.get('/v1/subjects', { adapter: createAdapter({ fail: 401 }) });
        await waitUntilPasswordIsRequired();
        expect(exitFullscreen).toHaveBeenCalledOnce();
      });

      it('should still ask for the password when the browser refuses to leave fullscreen', async () => {
        const error = new Error('Not allowed');
        const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
        exitFullscreen.mockRejectedValue(error);
        void axios.get('/v1/subjects', { adapter: createAdapter({ fail: 401 }) });
        await waitUntilPasswordIsRequired();
        expect(consoleError).toHaveBeenCalledWith(error);
      });
    });
  });

  describe('retries', () => {
    it('should retry a read that failed transiently, so a network blip is invisible to the user', async () => {
      const adapter = createAdapter({ fail: 503 }, { status: 200 });
      const response = await axios.get('/v1/subjects', { adapter });
      expect(response.status).toBe(200);
      expect(adapter).toHaveBeenCalledTimes(2);
    });

    it('should not notify the user about a failure that a retry recovered from', async () => {
      await axios.get('/v1/subjects', { adapter: createAdapter({ fail: true }, { status: 200 }) });
      expect(getNotifications()).toHaveLength(0);
    });

    it('should report each retry to the store, so the connectivity banner can show it', async () => {
      await axios.get('/v1/subjects', { adapter: createAdapter({ fail: 502 }, { status: 200 }) });
      expect(store.beginRetry).toHaveBeenCalledOnce();
      expect(store.endRetry).toHaveBeenCalledOnce();
    });

    it('should keep retrying across consecutive transient failures', async () => {
      const adapter = createAdapter({ fail: 504 }, { fail: true }, { status: 200 });
      const response = await axios.get('/v1/subjects', { adapter });
      expect(adapter).toHaveBeenCalledTimes(3);
      expect(response.config.retryCount).toBe(2);
    });

    it('should report the end of a retry that failed again, so the banner does not stick', async () => {
      await expect(
        axios.get('/v1/subjects', { adapter: createAdapter({ fail: 503 }, { fail: 400 }) })
      ).rejects.toBeInstanceOf(AxiosError);
      expect(store.endRetry).toHaveBeenCalledOnce();
    });

    it('should wait an exponentially growing, jittered delay before each retry', async () => {
      vi.mocked(Math.random).mockReturnValue(1);
      vi.useFakeTimers();
      const adapter = createAdapter({ fail: true }, { fail: true }, { status: 200 });
      void axios.get('/v1/subjects', { adapter });
      await vi.advanceTimersByTimeAsync(249);
      expect(adapter).toHaveBeenCalledTimes(1);
      await vi.advanceTimersByTimeAsync(1);
      expect(adapter).toHaveBeenCalledTimes(2);
      await vi.advanceTimersByTimeAsync(499);
      expect(adapter).toHaveBeenCalledTimes(2);
      await vi.advanceTimersByTimeAsync(1);
      expect(adapter).toHaveBeenCalledTimes(3);
    });

    it('should cap the retry delay at two seconds, so a long outage does not stretch the wait between attempts', async () => {
      vi.mocked(Math.random).mockReturnValue(1);
      vi.useFakeTimers();
      const adapter = createAdapter({ fail: true }, { fail: true }, { fail: true }, { fail: true }, { fail: true });
      void axios.get('/v1/subjects', { adapter });
      await vi.advanceTimersByTimeAsync(250 + 500 + 1000 + 2000);
      expect(adapter).toHaveBeenCalledTimes(5);
      await vi.advanceTimersByTimeAsync(1999);
      expect(adapter).toHaveBeenCalledTimes(5);
      await vi.advanceTimersByTimeAsync(1);
      expect(adapter).toHaveBeenCalledTimes(6);
    });

    it('should give up once the retry budget is spent, and tell the user the server is unreachable', async () => {
      const adapter = createAdapter({ fail: 503 });
      const request = axios.get('/v1/subjects', { adapter, retryStartedAt: Date.now() - 15_000 });
      await expect(request).rejects.toBeInstanceOf(AxiosError);
      expect(adapter).toHaveBeenCalledOnce();
      expect(getNotifications()).toMatchObject([{ title: 'Connection Problem', type: 'warning' }]);
    });

    it('should not retry a write, since repeating it risks a duplicate submission', async () => {
      const adapter = createAdapter({ fail: true });
      await expect(axios.post('/v1/subjects', {}, { adapter })).rejects.toBeInstanceOf(AxiosError);
      expect(adapter).toHaveBeenCalledOnce();
    });

    it('should not retry a request whose method is unknown, since it may not be idempotent', async () => {
      const adapter = vi.fn<AxiosAdapter>(() => Promise.reject(createError({ headers: new AxiosHeaders() })));
      await expect(axios.get('/v1/subjects', { adapter })).rejects.toBeInstanceOf(AxiosError);
      expect(adapter).toHaveBeenCalledOnce();
    });

    it('should not retry an error the server deliberately returned', async () => {
      const adapter = createAdapter({ fail: 500 });
      await expect(axios.get('/v1/subjects', { adapter })).rejects.toBeInstanceOf(AxiosError);
      expect(adapter).toHaveBeenCalledOnce();
    });
  });

  describe('offline', () => {
    beforeEach(() => {
      vi.stubGlobal('navigator', { onLine: false });
    });

    it('should hold a retry until the browser comes back online', async () => {
      const adapter = createAdapter({ fail: true }, { status: 200 });
      const request = axios.get('/v1/subjects', { adapter });
      await vi.waitFor(() => expect(store.beginRetry).toHaveBeenCalled());
      expect(adapter).toHaveBeenCalledOnce();
      window.dispatchEvent(new Event('online'));
      await expect(request).resolves.toMatchObject({ status: 200 });
      expect(adapter).toHaveBeenCalledTimes(2);
    });

    it('should retry anyway after the longest offline wait, so a missed online event cannot stall a request', async () => {
      vi.useFakeTimers();
      const adapter = createAdapter({ fail: true }, { status: 200 });
      void axios.get('/v1/subjects', { adapter });
      await vi.advanceTimersByTimeAsync(14_990);
      expect(adapter).toHaveBeenCalledOnce();
      await vi.advanceTimersByTimeAsync(20);
      expect(adapter).toHaveBeenCalledTimes(2);
    });
  });

  describe('connectivity events', () => {
    it('should record in the store that the browser went offline', () => {
      window.dispatchEvent(new Event('offline'));
      expect(store.setIsOnline).toHaveBeenCalledWith(false);
    });

    it('should record in the store that the browser came back online', () => {
      window.dispatchEvent(new Event('online'));
      expect(store.setIsOnline).toHaveBeenCalledWith(true);
    });
  });

  describe('error notifications', () => {
    it('should report the status of a failed request', async () => {
      await expect(axios.get('/v1/subjects', { adapter: createAdapter({ fail: 404 }) })).rejects.toBeInstanceOf(
        AxiosError
      );
      expect(getNotifications()).toMatchObject([{ message: 'HTTP Request Failed', title: '404', type: 'error' }]);
    });

    it('should tell the user the server is unreachable when a write fails transiently', async () => {
      await expect(axios.post('/v1/subjects', {}, { adapter: createAdapter({ fail: 502 }) })).rejects.toBeInstanceOf(
        AxiosError
      );
      expect(getNotifications()).toMatchObject([
        {
          message: 'Unable to reach the server. Please check your connection and try again.',
          title: 'Connection Problem'
        }
      ]);
    });

    it('should stay silent for a request that shows its own error message', async () => {
      const adapter = createAdapter({ fail: 400 });
      await expect(
        axios.get('/v1/subjects', { adapter, meta: { disableDefaultErrorNotification: true } })
      ).rejects.toBeInstanceOf(AxiosError);
      expect(getNotifications()).toHaveLength(0);
    });

    it('should report an error that did not come from axios as unknown, and log it for debugging', async () => {
      const error = new Error('adapter crashed');
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
      await expect(axios.get('/v1/subjects', { adapter: () => Promise.reject(error) })).rejects.toBe(error);
      expect(getNotifications()).toMatchObject([{ message: 'Unknown Error', type: 'error' }]);
      expect(consoleError).toHaveBeenCalledWith(error);
    });
  });

  describe('isTransientError', () => {
    const config: InternalAxiosRequestConfig = { headers: new AxiosHeaders() };

    it.each([
      ['a dropped connection, which never received a response', createError(config)],
      ['a gateway error from the hospital network', createError(config, 502)],
      ['an unavailable upstream', createError(config, 503)],
      ['a gateway timeout', createError(config, 504)]
    ])('should treat %s as transient, so it is retried', (_, error) => {
      expect(axiosModule.isTransientError(error)).toBe(true);
    });

    it.each([
      ['an error the server deliberately returned', createError(config, 500)],
      ['a client error', createError(config, 400)],
      ['an error that did not come from axios', new Error('boom')]
    ])('should not treat %s as transient, so it surfaces immediately', (_, error) => {
      expect(axiosModule.isTransientError(error)).toBe(false);
    });
  });
});
