import type { User } from '@open-data-capture/common/user';

export const adminUser: User = Object.freeze({
  basePermissionLevel: 'ADMIN',
  firstName: 'David',
  groups: [],
  id: '12345',
  lastName: 'Roper',
  password: 'Password123',
  username: 'david'
});
