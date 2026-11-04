import { describe, expect, it } from 'vitest';

import {
  $CreateUserData,
  $PhoneNumber,
  $SelfUpdateUserData,
  $UpdateUserData,
  $UpdateUserPermissionsData,
  $User,
  MIN_PHONE_DIGITS
} from '../user.js';

describe('$UpdateUserData', () => {
  it('should strip additionalPermissions, so a profile update cannot grant anything', () => {
    const result = $UpdateUserData.safeParse({
      additionalPermissions: [{ action: 'manage', groupId: null, subject: 'all' }]
    });
    expect(result.success).toBe(true);
    expect(result.data).not.toHaveProperty('additionalPermissions');
  });

  it('should strip permissionSetId, so a profile update cannot assign a permission set', () => {
    const result = $UpdateUserData.safeParse({ permissionSetId: 'set-1' });
    expect(result.success).toBe(true);
    expect(result.data).not.toHaveProperty('permissionSetId');
  });

  it('should accept a promotion to administrator, which the create-time permission set rule does not reach', () => {
    expect($UpdateUserData.safeParse({ basePermissionLevel: 'ADMIN' }).success).toBe(true);
  });
});

describe('$UpdateUserPermissionsData', () => {
  it('should accept an empty set of custom grants, which is how every grant is revoked', () => {
    expect($UpdateUserPermissionsData.safeParse({ kind: 'custom', permissions: [] }).success).toBe(true);
  });

  it('should reject a grant confined to a group on a resource that cannot be', () => {
    const permissions = [{ action: 'read', groupId: 'group-1', subject: 'Instrument' }];
    expect($UpdateUserPermissionsData.safeParse({ kind: 'custom', permissions }).success).toBe(false);
  });

  it('should reject a grant that writes users, naming the offending entry, since it would do nothing', () => {
    const permissions = [
      { action: 'read', groupId: null, subject: 'Subject' },
      { action: 'update', groupId: null, subject: 'User' }
    ];
    const result = $UpdateUserPermissionsData.safeParse({ kind: 'custom', permissions });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual(['permissions', 1]);
  });

  it('should accept a permission set by its id', () => {
    expect($UpdateUserPermissionsData.safeParse({ kind: 'permissionSet', permissionSetId: 'set-1' }).success).toBe(
      true
    );
  });

  it('should reject a body without a kind, the shape every write took before permission sets', () => {
    expect($UpdateUserPermissionsData.safeParse({ permissions: [] }).success).toBe(false);
  });

  it('should drop custom grants sent beside a permission set, so a user can never hold both', () => {
    const result = $UpdateUserPermissionsData.safeParse({
      kind: 'permissionSet',
      permissions: [{ action: 'read', groupId: null, subject: 'Subject' }],
      permissionSetId: 'set-1'
    });
    expect(result.data).toStrictEqual({ kind: 'permissionSet', permissionSetId: 'set-1' });
  });
});

describe('$SelfUpdateUserData', () => {
  it('should accept null contact details, so an update can clear them', () => {
    expect($SelfUpdateUserData.safeParse({ email: null, phoneNumber: null }).success).toBe(true);
  });

  it('should reject a blank email, which would otherwise be stored as one', () => {
    expect($SelfUpdateUserData.safeParse({ email: '' }).success).toBe(false);
  });
});

describe('$CreateUserData', () => {
  const data = {
    basePermissionLevel: 'STANDARD',
    firstName: 'Jane',
    groupIds: [],
    lastName: 'Doe',
    password: 'password',
    username: 'jane.doe'
  };

  it('should reject null contact details, which are only clearable on update', () => {
    expect($CreateUserData.safeParse({ ...data, email: null }).success).toBe(false);
  });

  it('should reject a phone number the account page would then refuse to save', () => {
    expect($CreateUserData.safeParse({ ...data, phoneNumber: '123' }).success).toBe(false);
  });

  it('should accept a well-formed phone number', () => {
    expect($CreateUserData.safeParse({ ...data, phoneNumber: '(514) 555-1234' }).success).toBe(true);
  });

  it('should accept a permission set for a user below administrator', () => {
    expect($CreateUserData.safeParse({ ...data, permissionSetId: 'set-1' }).success).toBe(true);
  });

  it('should reject a permission set for an administrator, who already holds every permission', () => {
    const result = $CreateUserData.safeParse({ ...data, basePermissionLevel: 'ADMIN', permissionSetId: 'set-1' });
    expect(result.error?.issues[0]?.path).toEqual(['permissionSetId']);
  });
});

describe('$PhoneNumber', () => {
  it('should accept a number with spaces, dashes, and parentheses', () => {
    expect($PhoneNumber.safeParse('(514) 555-1234').success).toBe(true);
  });

  it('should accept a number with exactly the minimum number of digits', () => {
    expect($PhoneNumber.safeParse('12-34-567').success).toBe(true);
  });

  it('should reject a well-formed number with too few digits', () => {
    const result = $PhoneNumber.safeParse('12-34-56');
    expect(result.error?.issues[0]?.message).toBe(`Phone number must contain at least ${MIN_PHONE_DIGITS} digits`);
  });

  it('should reject a malformed number with a format message', () => {
    const result = $PhoneNumber.safeParse('abcdefgh');
    expect(result.error?.issues[0]?.message).toBe('Invalid phone number');
  });

  it('should reject a blank value, since an absent number is spelled undefined or null', () => {
    expect($PhoneNumber.safeParse('').success).toBe(false);
  });

  it.each(['+1 514 555 1234', '+1 (514) 555-1234', '+33 1 23 45 67 89', '01 23 45 67 89', '+44 20 7946 0958'])(
    'should accept the phone number %s, so international and grouped national formats can be saved',
    (phoneNumber) => {
      expect($PhoneNumber.safeParse(phoneNumber).success).toBe(true);
    }
  );

  it('should reject a number with more digits than E.164 allows', () => {
    const result = $PhoneNumber.safeParse('+1 234 567 890 123 456');
    expect(result.error?.issues[0]?.message).toBe('Invalid phone number');
  });
});

describe('$User', () => {
  it('should accept a stored number predating the digit minimum, so the read model still parses', () => {
    expect($User.shape.phoneNumber.safeParse('123').success).toBe(true);
  });

  it('should accept a stored grant that writes users, so a user holding one from before still parses', () => {
    const additionalPermissions = [{ action: 'update', groupId: null, subject: 'User' }];
    expect($User.shape.additionalPermissions.safeParse(additionalPermissions).success).toBe(true);
  });
});
