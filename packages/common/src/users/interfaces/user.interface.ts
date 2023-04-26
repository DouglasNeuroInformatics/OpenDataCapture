import { BasePermissionLevel } from '../enums/base-permission-level.enum';

import { UserPreferences } from './user-preferences.interface';

import { Group } from '@/groups';

export interface User {
  username: string;
  password: string;
  groups: Group[];
  basePermissionLevel?: BasePermissionLevel;
  isAdmin?: boolean;
  firstName?: string;
  lastName?: string;
  preferences?: UserPreferences;
}
