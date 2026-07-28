import { describe, expect, it } from 'vitest';

import { $CreateUserData, $SelfUpdateUserData } from './user.js';

describe('$SelfUpdateUserData', () => {
  it('should accept null contact details, so an update can clear them', () => {
    expect($SelfUpdateUserData.safeParse({ email: null, phoneNumber: null }).success).toBe(true);
  });

  it('should reject a blank email, which would otherwise be stored as one', () => {
    expect($SelfUpdateUserData.safeParse({ email: '' }).success).toBe(false);
  });
});

describe('$CreateUserData', () => {
  it('should reject null contact details, which are only clearable on update', () => {
    const data = {
      basePermissionLevel: 'STANDARD',
      email: null,
      firstName: 'Jane',
      groupIds: [],
      lastName: 'Doe',
      password: 'password',
      username: 'jane.doe'
    };
    expect($CreateUserData.safeParse(data).success).toBe(false);
  });
});
