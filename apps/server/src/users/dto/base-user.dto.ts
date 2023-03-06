import { UserInterface, UserRole } from '../interfaces/user.interface';

export class BaseUserDto implements UserInterface {
  username: string;
  password: string;
  role: UserRole;
  refreshToken: string;
}
