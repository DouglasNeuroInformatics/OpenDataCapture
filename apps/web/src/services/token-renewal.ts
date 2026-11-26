import type { AuthPayload } from '@opendatacapture/schemas/auth';
import axios, { isAxiosError } from 'axios';

import { useAppStore } from '@/store';

// A tab asks for a new token at most this often. It bounds the requests an active tab makes, and how
// far short of the idle limit an unattended one expires: the last token is at most this old when the
// user stops.
const RENEWAL_INTERVAL = 60_000;

// Node refuses a request whose headers total more than 16 KiB, and a token grows with the user's
// groups (issue 1534). A token that large arriving while someone works would turn every request
// after it into a 431, so the tab keeps the smaller one it has for as long as that one lasts.
const MAX_RENEWED_TOKEN_LENGTH = 14 * 1024;

// Deliberate input only. A browser can fire pointer movement with nobody at the workstation, when
// the page moves under a resting cursor.
const ACTIVITY_EVENTS = ['keydown', 'pointerdown', 'touchstart', 'wheel'] as const;

let lastAttemptAt = 0;
let pendingRenewal: null | Promise<void> = null;
let expiryTimer: ReturnType<typeof setTimeout> | undefined;

async function requestRenewedAccessToken(): Promise<void> {
  const { accessToken } = useAppStore.getState();
  lastAttemptAt = Date.now();
  let renewedAccessToken: string;
  try {
    const response = await axios.post<AuthPayload>('/v1/auth/refresh', undefined, {
      meta: { disableDefaultErrorNotification: true, disableDefaultReauthentication: true }
    });
    renewedAccessToken = response.data.accessToken;
  } catch (error) {
    if (isAxiosError(error) && (error.response?.status === 401 || error.response?.status === 403)) {
      useAppStore.getState().requireReauthentication();
      return;
    }
    // A dropped connection, a throttled request or a server fault says nothing about the sign-in.
    // The token in hand still works, so later activity tries again.
    console.error(error);
    return;
  }
  const store = useAppStore.getState();
  // The user signed in again through the password dialog while this request was in flight.
  if (store.accessToken !== accessToken) {
    return;
  }
  if (renewedAccessToken.length > MAX_RENEWED_TOKEN_LENGTH) {
    console.error(`Renewed access token is too large to send (${renewedAccessToken.length} characters)`);
    // Every later renewal would be as large, so the tab stops asking, and the warning tells the user
    // their password will be needed rather than offering to stay signed in.
    store.endAccessTokenRenewal();
    return;
  }
  if (store.reauthenticate(renewedAccessToken) !== 'accepted') {
    store.requireReauthentication();
  }
}

/** Concurrent calls share one request. */
function renewAccessToken(): Promise<void> {
  pendingRenewal ??= requestRenewedAccessToken().finally(() => {
    pendingRenewal = null;
  });
  return pendingRenewal;
}

function handleActivity(event: Event): void {
  const { accessTokenValidity, isReauthenticationRequired } = useAppStore.getState();
  // A script can dispatch events of its own; only the browser marks one as coming from a person.
  if (!event.isTrusted || !accessTokenValidity?.isRenewable || isReauthenticationRequired) {
    return;
  }
  const now = Date.now();
  if (now >= accessTokenValidity.expiresAt) {
    return;
  }
  if (now - Math.max(accessTokenValidity.receivedAt, lastAttemptAt) >= RENEWAL_INTERVAL) {
    void renewAccessToken();
  }
}

function watchForActivity(target: Window): void {
  for (const type of ACTIVITY_EVENTS) {
    target.addEventListener(type, handleActivity, { capture: true, passive: true });
  }
}

/**
 * Covers the page once the token has run out, without waiting for a request to fail, so an
 * unattended screen stops showing what was on it.
 */
function requireReauthenticationOnceExpired(): void {
  const { accessTokenValidity, requireReauthentication } = useAppStore.getState();
  if (!accessTokenValidity) {
    return;
  }
  // A timer runs on its own clock, so it can fire while `Date.now()` is still short of the expiry,
  // after the system clock was set back for one. Waiting out the difference keeps the page from
  // staying uncovered until something else happens to check.
  if (Date.now() < accessTokenValidity.expiresAt) {
    scheduleExpiry();
    return;
  }
  // An instrument filling the screen is left to finish: the dialog could not be seen over it, and
  // leaving fullscreen can spoil the task. The `fullscreenchange` listener below runs this again.
  if (document.fullscreenElement) {
    return;
  }
  requireReauthentication();
}

function scheduleExpiry(): void {
  clearTimeout(expiryTimer);
  const { accessTokenValidity } = useAppStore.getState();
  if (accessTokenValidity) {
    expiryTimer = setTimeout(requireReauthenticationOnceExpired, accessTokenValidity.expiresAt - Date.now());
  }
}

watchForActivity(window);

// An interactive instrument runs in a same-origin frame, and input inside a frame never reaches this
// window. A frame's `load` does not bubble, but it can be captured here.
document.addEventListener(
  'load',
  (event) => {
    if (event.target instanceof HTMLIFrameElement && event.target.contentWindow) {
      watchForActivity(event.target.contentWindow);
    }
  },
  { capture: true }
);

document.addEventListener('fullscreenchange', requireReauthenticationOnceExpired);
// A hidden tab's timers are throttled, and a sleeping workstation's do not run at all.
document.addEventListener('visibilitychange', requireReauthenticationOnceExpired);

useAppStore.subscribe((state, previousState) => {
  if (state.accessTokenValidity !== previousState.accessTokenValidity) {
    scheduleExpiry();
  }
});
scheduleExpiry();

export { renewAccessToken };
