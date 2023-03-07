import { UserRole } from '@/users/interfaces/user.interface';

export interface JwtPayload {
  username: string;
  role: UserRole;
}
