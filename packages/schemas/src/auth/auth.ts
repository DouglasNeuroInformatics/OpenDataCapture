import { z } from 'zod/v4';

import type { Permissions } from '../core/core.js';
import type { Group } from '../group/group.js';
import type { BasePermissionLevel } from '../user/user.js';

export type AuthPayload = {
  accessToken: string;
};

export type $LoginCredentials = z.infer<typeof $LoginCredentials>;
export const $LoginCredentials = z.object({
  password: z.string().min(1),
  username: z.string().min(1)
});

/**
 * Sent with the value `true` on `POST /auth/login` by a client a person is sitting at. The token it
 * gets expires after the idle limit instead of an hour, so it has to be renewed while they work.
 */
export const INTERACTIVE_SIGN_IN_HEADER = 'odc-interactive-sign-in';

/** Both times are milliseconds since the epoch, unlike the JWT's own `iat` and `exp`, which are seconds. */
export type TokenRenewal = {
  authenticatedAt: number;
  endsAt: number;
  isInteractive: boolean;
};

export type TokenPayload = {
  additionalPermissions?: Permissions;
  basePermissionLevel: BasePermissionLevel | null;
  firstName: null | string;
  groups: Group[];
  id: string;
  /**
   * `'instrument'` marks the reduced token `GET /auth/create-instrument-token` mints. It carries only
   * `kind` and `permissions`, and the API refuses it on every route not marked
   * `@AcceptsInstrumentToken()`, so the fields it lacks are never read.
   */
  kind: 'instrument' | 'login';
  lastName: null | string;
  /**
   * Whether the holder must choose a new password before they may use the app. Carried on the token
   * so `apps/web` can gate navigation without a request, and so `AbilityFactory` can narrow
   * `permissions` to the reset itself — the two must agree, and this is the one place they can.
   */
  mustResetPassword: boolean;
  permissions: Permissions;
  /**
   * Absent on an `'instrument'` token and on a login token signed before `POST /auth/refresh` existed.
   * The API renews neither.
   */
  renewal?: TokenRenewal;
  username: string;
};
