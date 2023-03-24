import { Permissions } from '@/auth/types/permissions.type';

export interface JwtPayload {
  username: string;
  permissions: Permissions;
}
