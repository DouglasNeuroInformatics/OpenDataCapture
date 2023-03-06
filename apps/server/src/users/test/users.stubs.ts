import bcrypt from 'bcrypt';

import { User } from '@/users/schemas/user.schema';

export class UserStubs {
  static mockPlainTextPassword = 'Password123';
  static mockHashedPassword = bcrypt.hashSync(UserStubs.mockPlainTextPassword, 10);

  static get mockSystemAdmin(): User {
    return {
      username: 'system-admin',
      password: this.mockHashedPassword,
      role: 'system-admin'
    };
  }

  static get mockGroupManager(): User {
    return {
      username: 'group-manager',
      password: this.mockHashedPassword,
      role: 'group-manager'
    };
  }

  static get mockStandardUser(): User {
    return {
      username: 'standard-user',
      password: this.mockHashedPassword,
      role: 'standard-user'
    };
  }
}
