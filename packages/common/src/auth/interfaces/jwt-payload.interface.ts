import { Permissions } from '../types/permissions.type';

import { Group } from '@/groups';

export interface JwtPayload {
  username: string;
  permissions: Permissions;
  isAdmin?: boolean;
  firstName?: string;
  lastName?: string;
  groups: Group[];
}
