export type UserRole = 'system-admin' | 'group-manager' | 'standard-user';

export interface UserInterface {
  username: string;
  password: string;
  role: UserRole;
  refreshToken?: string;
}
