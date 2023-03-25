import { Permissions } from '../types/permissions.type';

export interface JwtPayload {
  username: string;
  permissions: Permissions;
}
