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

export type TokenPayload = {
  additionalPermissions?: Permissions;
  basePermissionLevel: BasePermissionLevel | null;
  firstName: null | string;
  groups: Group[];
  id: string;
  lastName: null | string;
  /**
   * Whether the holder must choose a new password before they may use the app. Carried on the token
   * so `apps/web` can gate navigation without a request, and so `AbilityFactory` can narrow
   * `permissions` to the reset itself — the two must agree, and this is the one place they can.
   */
  mustResetPassword: boolean;
  permissions: Permissions;
  username: string;
};
