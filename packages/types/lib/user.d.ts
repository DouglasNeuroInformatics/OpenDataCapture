import { Group } from './group';

export type UserPreferences = {
  prefersDarkMode?: boolean;
  prefersMobileLayout?: boolean;
};

export type BasePermissionLevel = 'ADMIN' | 'GROUP_MANAGER' | 'STANDARD';

export type User = {
  basePermissionLevel?: BasePermissionLevel;
  firstName?: string;
  groups: Group[];
  lastName?: string;
  password: string;
  preferences?: UserPreferences;
  username: string;
};
