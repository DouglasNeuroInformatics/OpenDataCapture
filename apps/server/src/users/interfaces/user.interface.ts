export type UserRole = 'system-admin' | 'group-admin' | 'standard-user';

export interface UserInterface {
  username: string;
  password: string;
  role: UserRole;
  refreshToken?: string;
}
