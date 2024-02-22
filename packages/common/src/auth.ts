import { z } from 'zod';

import type { Permissions } from './core.js';
import type { Group } from './group.js';

export type AuthPayload = {
  accessToken: string;
};

export const $LoginCredentials = z.object({
  password: z.string(),
  username: z.string()
});

export type LoginCredentials = z.infer<typeof $LoginCredentials>;

export type JwtPayload = {
  firstName: null | string;
  groups: Group[];
  lastName: null | string;
  permissions: Permissions;
  username: string;
};
