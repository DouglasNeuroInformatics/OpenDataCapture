import type { User } from '@open-data-capture/common/user';

export const adminUser: User = Object.freeze({
  basePermissionLevel: 'ADMIN',
  createdAt: new Date(),
  firstName: 'David',
  groupIds: [],
  groups: [],
  id: '12345',
  lastName: 'Roper',
  password: 'Password123',
  updatedAt: new Date(),
  username: 'david'
});
