import { BasePermissionLevel } from '@/auth';
import { Group } from '@/groups';

export interface User {
  username: string;
  password: string;
  groups: Group[];
  basePermissionLevel?: BasePermissionLevel;
  firstName?: string;
  lastName?: string;
}
