import { UserRole } from '@/users/users.types';

export interface JwtPayload {
  username: string;
  role: UserRole;
}
