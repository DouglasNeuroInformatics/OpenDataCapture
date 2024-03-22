import { z } from 'zod';

import type { Permissions } from '../core/core.index.js';
import type { Group } from '../group/group.index.js';

export type AuthPayload = {
  accessToken: string;
};

export type LoginCredentials = z.infer<typeof $LoginCredentials>;
export const $LoginCredentials = z.object({
  password: z.string(),
  username: z.string()
});

export type JwtPayload = {
  firstName: null | string;
  groups: Group[];
  lastName: null | string;
  permissions: Permissions;
  username: string;
};
