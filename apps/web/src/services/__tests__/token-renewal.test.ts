import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Mock } from 'vitest';

import * as tokenRenewal from '@/services/token-renewal';
import type { AccessTokenValidity, AuthSlice } from '@/store/types';

type StoreFixture = {
  accessToken: null | string;
  accessTokenValidity: AccessTokenValidity | null;
  endAccessTokenRenewal: Mock;
  expireAccessToken: Mock;
  isReauthenticationRequired: boolean;
  reauthenticate: Mock<AuthSlice['reauthenticate']>;
  requireReauthentication: Mock;
};

type StoreListener = (state: StoreFixture, previousState: StoreFixture) => void;

const store = vi.hoisted((): StoreFixture => ({
  accessToken: null,
  accessTokenValidity: null,
  endAccessTokenRenewal: vi.fn(),
  expireAccessToken: vi.fn(),
  isReauthenticationRequired: false,
  reauthenticate: vi.fn(),
  requireReauthentication: vi.fn()
}));

const storeListeners = vi.hoisted(() => new Set<StoreListener>());

const mocks = vi.hoisted(() => ({
  post: vi.fn<(url: string, data: undefined, config: object) => Promise<{ data: unknown }>>()
}));

vi.mock('@/store', () => ({
  useAppStore: {
    getState: () => store,
    subscribe: (listener: StoreListener) => {
      storeListeners.add(listener);
    }
  }
}));

vi.mock('axios', () => ({
  default: { post: mocks.post },
  isAxiosError: (error: unknown) => error instanceof RefusedRequest
}));

class RefusedRequest extends Error {
  response: { status: number };

  constructor(status: number) {
    super(`Request failed with status code ${status}`);
    this.response = { status };
  }
}

const MINUTE = 60_000;

const encodeSegment = (value: object) => btoa(JSON.stringify(value)).replace(/=+$/, '');

const TOKEN_PREFIX = `${encodeSegment({ alg: 'HS256', typ: 'JWT' })}.${encodeSegment({ id: 'user-1' })}.`;

/** A token of the shape the API signs, padded in its signature to an exact length. */
const createAccessToken = (length = TOKEN_PREFIX.length + 9) => TOKEN_PREFIX + 'x'.repeat(length - TOKEN_PREFIX.length);

const RENEWED_TOKEN = createAccessToken();

let now = new Date('2026-01-01T00:00:00.000Z').getTime();

const setAccessTokenValidity = (accessTokenValidity: AccessTokenValidity | null) => {
  const previousState = { ...store };
  store.accessTokenValidity = accessTokenValidity;
  for (const listener of storeListeners) {
    listener(store, previousState);
  }
};

/** A renewable token received `age` ago with 14 minutes left, unless overridden. */
const signIn = (age: number, overrides: Partial<AccessTokenValidity> = {}) => {
  store.accessToken = 'current-token';
  setAccessTokenValidity({ expiresAt: now + 14 * MINUTE, isRenewable: true, receivedAt: now - age, ...overrides });
};

// The browser alone marks an event as trusted; happy-dom leaves the flag for a test to set.
const createInput = (type: string, isTrusted = true) => {
  const event = new Event(type);
  Object.defineProperty(event, 'isTrusted', { value: isTrusted });
  return event;
};

const flushRenewal = () => vi.advanceTimersByTimeAsync(0);

const setFullscreenElement = (element: Element | null) => {
  Object.defineProperty(document, 'fullscreenElement', { configurable: true, value: element });
};

describe('token-renewal', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Far enough past the previous test that its last attempt no longer holds the next one back.
    now += 60 * MINUTE;
    vi.setSystemTime(now);
    store.isReauthenticationRequired = false;
    store.reauthenticate.mockReturnValue('accepted');
    mocks.post.mockResolvedValue({ data: { accessToken: RENEWED_TOKEN } });
  });

  afterEach(() => {
    setAccessTokenValidity(null);
    store.accessToken = null;
    Reflect.deleteProperty(document, 'fullscreenElement');
    vi.clearAllMocks();
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('activity', () => {
    it.each(['keydown', 'pointerdown', 'touchstart', 'wheel'])(
      'should renew a token that is a minute old when the user makes a %s',
      async (type) => {
        signIn(MINUTE);
        window.dispatchEvent(createInput(type));
        await flushRenewal();
        expect(mocks.post).toHaveBeenCalledWith('/v1/auth/refresh', undefined, {
          meta: { disableDefaultErrorNotification: true, disableDefaultReauthentication: true }
        });
        expect(store.reauthenticate).toHaveBeenCalledWith(RENEWED_TOKEN);
      }
    );

    it('should not count pointer movement, which a browser can report with nobody at the workstation', () => {
      signIn(MINUTE);
      window.dispatchEvent(createInput('pointermove'));
      expect(mocks.post).not.toHaveBeenCalled();
    });

    it('should ignore input a script dispatched, so page code cannot keep an unattended tab alive', () => {
      signIn(MINUTE);
      window.dispatchEvent(createInput('keydown', false));
      expect(mocks.post).not.toHaveBeenCalled();
    });

    it('should not renew a token less than a minute old, so an active tab asks at most once a minute', () => {
      signIn(MINUTE - 1);
      window.dispatchEvent(createInput('keydown'));
      expect(mocks.post).not.toHaveBeenCalled();
    });

    it('should not renew a token that already runs to the end of the sign-in', () => {
      signIn(MINUTE, { isRenewable: false });
      window.dispatchEvent(createInput('keydown'));
      expect(mocks.post).not.toHaveBeenCalled();
    });

    it('should not renew a token that has run out, which only a password can replace', () => {
      signIn(MINUTE, { expiresAt: now });
      window.dispatchEvent(createInput('keydown'));
      expect(mocks.post).not.toHaveBeenCalled();
    });

    it('should not renew while the password dialog is open, so typing in it sends nothing', () => {
      signIn(MINUTE);
      store.isReauthenticationRequired = true;
      window.dispatchEvent(createInput('keydown'));
      expect(mocks.post).not.toHaveBeenCalled();
    });

    it('should do nothing while nobody is signed in', () => {
      window.dispatchEvent(createInput('keydown'));
      expect(mocks.post).not.toHaveBeenCalled();
    });

    it('should wait a minute after an attempt before making another', async () => {
      mocks.post.mockRejectedValueOnce(new Error('Network Error'));
      vi.spyOn(console, 'error').mockImplementation(() => undefined);
      signIn(MINUTE);
      window.dispatchEvent(createInput('keydown'));
      await flushRenewal();
      vi.setSystemTime(now + MINUTE - 1);
      window.dispatchEvent(createInput('keydown'));
      expect(mocks.post).toHaveBeenCalledOnce();
      vi.setSystemTime(now + MINUTE);
      window.dispatchEvent(createInput('keydown'));
      expect(mocks.post).toHaveBeenCalledTimes(2);
    });
  });

  describe('frames', () => {
    const loadFrameWith = (contentWindow: unknown) => {
      const frame = document.createElement('iframe');
      Object.defineProperty(frame, 'contentWindow', { value: contentWindow });
      document.body.append(frame);
      frame.dispatchEvent(new Event('load'));
      frame.remove();
    };

    it('should count input inside a frame, where an interactive instrument runs', async () => {
      const contentWindow = new EventTarget();
      loadFrameWith(contentWindow);
      signIn(MINUTE);
      contentWindow.dispatchEvent(createInput('pointerdown'));
      await flushRenewal();
      expect(mocks.post).toHaveBeenCalledOnce();
    });

    it('should leave alone a frame that has no window', () => {
      expect(() => loadFrameWith(null)).not.toThrow();
    });

    it("should leave alone a frame from another origin, such as a password manager's, which refuses listeners", () => {
      const onError = vi.fn();
      window.addEventListener('error', onError);
      const contentWindow = {
        addEventListener: () => {
          throw new DOMException('Blocked a frame from accessing a cross-origin frame.', 'SecurityError');
        }
      };
      expect(() => loadFrameWith(contentWindow)).not.toThrow();
      window.removeEventListener('error', onError);
      expect(onError).not.toHaveBeenCalled();
    });

    it('should leave alone anything else that loads', () => {
      const image = document.createElement('img');
      const addEventListener = vi.spyOn(image, 'addEventListener');
      document.body.append(image);
      image.dispatchEvent(new Event('load'));
      image.remove();
      expect(addEventListener).not.toHaveBeenCalled();
    });
  });

  describe('renewAccessToken', () => {
    it('should share one request between callers that overlap', async () => {
      signIn(MINUTE);
      await Promise.all([tokenRenewal.renewAccessToken(), tokenRenewal.renewAccessToken()]);
      expect(mocks.post).toHaveBeenCalledOnce();
    });

    it('should send a new request once the previous one has finished', async () => {
      signIn(MINUTE);
      await tokenRenewal.renewAccessToken();
      await tokenRenewal.renewAccessToken();
      expect(mocks.post).toHaveBeenCalledTimes(2);
    });

    it.each([401, 403])(
      'should count the token as run out when the API refuses with %d, rather than open the dialog over an instrument that fills the screen',
      async (status) => {
        mocks.post.mockRejectedValue(new RefusedRequest(status));
        signIn(MINUTE);
        await tokenRenewal.renewAccessToken();
        expect(store.expireAccessToken).toHaveBeenCalledOnce();
        expect(store.requireReauthentication).not.toHaveBeenCalled();
        expect(store.reauthenticate).not.toHaveBeenCalled();
      }
    );

    it('should ignore a refusal that arrives after the user has signed in again, which says nothing about their new token', async () => {
      signIn(MINUTE);
      mocks.post.mockImplementation(() => {
        store.accessToken = 'token-from-the-password-dialog';
        return Promise.reject(new RefusedRequest(401));
      });
      await tokenRenewal.renewAccessToken();
      expect(store.expireAccessToken).not.toHaveBeenCalled();
    });

    it.each(['<html>Sign in to the network</html>', null, { accessToken: 42 }, { accessToken: 'not-a-token' }])(
      'should keep the token it has when the answer is not from the API, such as a captive portal page (%o)',
      async (data) => {
        const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
        mocks.post.mockResolvedValue({ data });
        signIn(MINUTE);
        await tokenRenewal.renewAccessToken();
        expect(consoleError).toHaveBeenCalledOnce();
        expect(store.reauthenticate).not.toHaveBeenCalled();
        expect(store.expireAccessToken).not.toHaveBeenCalled();
      }
    );

    it.each([new RefusedRequest(429), new RefusedRequest(503), new Error('Network Error')])(
      'should keep the token it has and log the failure when the request fails otherwise (%s)',
      async (error) => {
        const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
        mocks.post.mockRejectedValue(error);
        signIn(MINUTE);
        await tokenRenewal.renewAccessToken();
        expect(consoleError).toHaveBeenCalledWith(error);
        expect(store.requireReauthentication).not.toHaveBeenCalled();
      }
    );

    it('should discard the renewed token when the user signed in again while the request was in flight', async () => {
      signIn(MINUTE);
      mocks.post.mockImplementation(() => {
        store.accessToken = 'token-from-the-password-dialog';
        return Promise.resolve({ data: { accessToken: RENEWED_TOKEN } });
      });
      await tokenRenewal.renewAccessToken();
      expect(store.reauthenticate).not.toHaveBeenCalled();
    });

    it('should keep the token it has when the renewed one is too large for a request header', async () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
      mocks.post.mockResolvedValue({ data: { accessToken: createAccessToken(14 * 1024 + 1) } });
      signIn(MINUTE);
      await tokenRenewal.renewAccessToken();
      expect(store.reauthenticate).not.toHaveBeenCalled();
      expect(consoleError).toHaveBeenCalledOnce();
    });

    it('should stop renewing once a renewed token is too large, since every later one would be too', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => undefined);
      mocks.post.mockResolvedValue({ data: { accessToken: createAccessToken(14 * 1024 + 1) } });
      signIn(MINUTE);
      await tokenRenewal.renewAccessToken();
      expect(store.endAccessTokenRenewal).toHaveBeenCalledOnce();
    });

    it('should accept a renewed token at the largest size a request can carry', async () => {
      const accessToken = createAccessToken(14 * 1024);
      mocks.post.mockResolvedValue({ data: { accessToken } });
      signIn(MINUTE);
      await tokenRenewal.renewAccessToken();
      expect(store.reauthenticate).toHaveBeenCalledWith(accessToken);
    });

    it('should count the token as run out when the renewed one cannot carry on this tab', async () => {
      store.reauthenticate.mockReturnValue('differentUser');
      signIn(MINUTE);
      await tokenRenewal.renewAccessToken();
      expect(store.expireAccessToken).toHaveBeenCalledOnce();
    });
  });

  describe('expiry', () => {
    it('should ask for the password the moment the token runs out, so an unattended screen is covered', async () => {
      signIn(0, { expiresAt: now + 1000 });
      await vi.advanceTimersByTimeAsync(999);
      expect(store.requireReauthentication).not.toHaveBeenCalled();
      await vi.advanceTimersByTimeAsync(1);
      expect(store.requireReauthentication).toHaveBeenCalledOnce();
    });

    it('should wait out the difference when its timer fires early, as after the system clock was set back', async () => {
      signIn(0, { expiresAt: now + 1000 });
      vi.setSystemTime(now - 500);
      await vi.advanceTimersByTimeAsync(1000);
      expect(store.requireReauthentication).not.toHaveBeenCalled();
      await vi.advanceTimersByTimeAsync(500);
      expect(store.requireReauthentication).toHaveBeenCalledOnce();
    });

    it('should count down afresh when the token is renewed', async () => {
      signIn(0, { expiresAt: now + 1000 });
      signIn(0, { expiresAt: now + 5000 });
      await vi.advanceTimersByTimeAsync(4999);
      expect(store.requireReauthentication).not.toHaveBeenCalled();
      await vi.advanceTimersByTimeAsync(1);
      expect(store.requireReauthentication).toHaveBeenCalledOnce();
    });

    it('should keep the countdown it has when the store changes for some other reason', () => {
      signIn(0);
      const setTimeoutSpy = vi.spyOn(globalThis, 'setTimeout');
      setAccessTokenValidity(store.accessTokenValidity);
      expect(setTimeoutSpy).not.toHaveBeenCalled();
    });

    it('should stop counting down once nobody is signed in', async () => {
      signIn(0, { expiresAt: now + 1000 });
      setAccessTokenValidity(null);
      await vi.advanceTimersByTimeAsync(1000);
      expect(store.requireReauthentication).not.toHaveBeenCalled();
    });

    it('should not interrupt an instrument that fills the screen, and ask once it leaves fullscreen', async () => {
      setFullscreenElement(document.body);
      signIn(0, { expiresAt: now + 1000 });
      await vi.advanceTimersByTimeAsync(1000);
      expect(store.requireReauthentication).not.toHaveBeenCalled();
      setFullscreenElement(null);
      document.dispatchEvent(new Event('fullscreenchange'));
      expect(store.requireReauthentication).toHaveBeenCalledOnce();
    });

    it('should ask when a tab is shown again after its token ran out while its timers were suspended', () => {
      signIn(0, { expiresAt: now + 1000 });
      vi.setSystemTime(now + 1000);
      document.dispatchEvent(new Event('visibilitychange'));
      expect(store.requireReauthentication).toHaveBeenCalledOnce();
    });

    it('should not ask when a tab is shown again while its token is still good', () => {
      signIn(0);
      document.dispatchEvent(new Event('visibilitychange'));
      expect(store.requireReauthentication).not.toHaveBeenCalled();
    });

    it('should not ask when a tab is shown again with nobody signed in', () => {
      document.dispatchEvent(new Event('visibilitychange'));
      expect(store.requireReauthentication).not.toHaveBeenCalled();
    });
  });
});
