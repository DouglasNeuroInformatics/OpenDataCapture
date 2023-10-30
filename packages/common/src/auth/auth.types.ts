import type { Permissions } from '../core/core.types';
import type { Group } from '../group/group.types';

export type AuthPayload = {
  accessToken: string;
};

export type LoginCredentials = {
  password: string;
  username: string;
};

export type JwtPayload = {
  firstName?: string;
  groups: Group[];
  lastName?: string;
  permissions: Permissions;
  username: string;
};
