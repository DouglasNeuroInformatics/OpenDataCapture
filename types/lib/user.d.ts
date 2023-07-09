import { Group } from './group';

export type UserPreferences = {
  prefersDarkMode?: boolean;
  prefersMobileLayout?: boolean;
};

export type BasePermissionLevel = 'ADMIN' | 'GROUP_MANAGER' | 'STANDARD';

export type User = {
  username: string;
  password: string;
  groups: Group[];
  basePermissionLevel?: BasePermissionLevel;
  isAdmin?: boolean;
  firstName?: string;
  lastName?: string;
  preferences?: UserPreferences;
};
