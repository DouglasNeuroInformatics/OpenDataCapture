export const DEFAULT_LOGIN_REQUEST_THROTTLER_LIMIT = 50;

export const DEFAULT_LOGIN_REQUEST_THROTTLER_TTL = 60_000;

/** Assignment emails a single client may send per {@link ASSIGNMENT_EMAIL_THROTTLER_TTL}. */
export const ASSIGNMENT_EMAIL_THROTTLER_LIMIT = 20;

export const ASSIGNMENT_EMAIL_THROTTLER_TTL = 60_000;

/** Token renewals one user at one address may make per ten seconds. A web tab makes one a minute. */
export const REFRESH_REQUEST_THROTTLER_MEDIUM_LIMIT = 10;

/** Token renewals one user at one address may make per minute. */
export const REFRESH_REQUEST_THROTTLER_LONG_LIMIT = 30;
