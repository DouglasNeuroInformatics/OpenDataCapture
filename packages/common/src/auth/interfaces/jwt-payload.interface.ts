import { Group } from '../../groups';
import { Permissions } from '../types/permissions.type';

export interface JwtPayload {
  username: string;
  permissions: Permissions;
  isAdmin?: boolean;
  firstName?: string;
  lastName?: string;
  groups: Group[];
}
