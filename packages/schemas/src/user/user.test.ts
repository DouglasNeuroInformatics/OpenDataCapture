import { describe, expect, it } from 'vitest';

import { $CreateUserData, $PhoneNumber, $SelfUpdateUserData, $User, MIN_PHONE_DIGITS } from './user.js';

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
});

describe('$User', () => {
  it('should accept a stored number predating the digit minimum, so the read model still parses', () => {
    expect($User.shape.phoneNumber.safeParse('123').success).toBe(true);
  });
});
