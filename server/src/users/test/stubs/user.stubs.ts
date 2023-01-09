import bcrypt from 'bcrypt';
import { UserRole } from 'common';

import { User } from '@/users/schemas/user.schema';

export const mockAdminPlainTextPassword = 'default';

export const mockAdminHashedPassport = bcrypt.hashSync(mockAdminPlainTextPassword, 10);

export const mockAdmin: User = Object.freeze({
  username: 'admin',
  password: mockAdminHashedPassport,
  role: UserRole.Admin,
  refreshToken: 'token'
});

export const mockUserPlainTextPassword = mockAdminPlainTextPassword;

export const mockUserHashedPassport = mockAdminHashedPassport;

export const mockUser: User = Object.freeze({
  username: 'user',
  password: mockUserHashedPassport,
  role: UserRole.User
});
