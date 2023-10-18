import { Group } from './group';

export type BasePermissionLevel = 'ADMIN' | 'GROUP_MANAGER' | 'STANDARD';

export type User = {
  basePermissionLevel?: BasePermissionLevel;
  firstName?: string;
  groups: Group[];
  lastName?: string;
  password: string;
  username: string;
};
