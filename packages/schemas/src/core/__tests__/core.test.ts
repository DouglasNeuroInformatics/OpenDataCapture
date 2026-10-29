import { describe, expect, it } from 'vitest';

import {
  $DateLike,
  $GroupScopableSubjectName,
  $Json,
  $LicenseIdentifier,
  $RegexString,
  $UserPermission,
  isGrantablePermission,
  resolveActiveLanguage,
  toInstrumentAuthoringLanguage
} from '../core.js';

describe('$DateLike', () => {
  it('should accept a Date, returning the same instant', () => {
    const date = new Date('2025-01-31T14:30:00.000Z');
    expect($DateLike.parse(date)).toEqual(date);
  });

  it('should convert an ISO 8601 date-time in UTC to a Date', () => {
    expect($DateLike.parse('2025-01-31T14:30:00.000Z')).toEqual(new Date('2025-01-31T14:30:00.000Z'));
  });

  it('should convert an ISO 8601 date-time with an offset to the instant it denotes', () => {
    expect($DateLike.parse('2025-01-31T14:30:00+05:30')).toEqual(new Date('2025-01-31T09:00:00.000Z'));
  });

  it.each([
    ['an empty string', ''],
    ['null', null],
    ['undefined', undefined],
    ['a number', 1_738_333_800_000],
    ['a boolean', true],
    ['an object', {}],
    ['a date without a time', '2025-01-31'],
    ['a date-time without an offset, whose instant depends on the reader\u2019s time zone', '2025-01-31T14:30:00'],
    ['a malformed string', 'yesterday'],
    ['a date-time that does not exist', '2025-02-30T14:30:00Z'],
    ['an invalid Date', new Date(Number.NaN)]
  ])('should reject %s, rather than read it as some other moment', (_, value) => {
    expect($DateLike.safeParse(value).success).toBe(false);
  });
});

describe('$GroupScopableSubjectName', () => {
  it.each(['all', 'Instrument'])(
    'should reject %s, which has no single group field to confine a grant to',
    (subject) => {
      expect($GroupScopableSubjectName.safeParse(subject).success).toBe(false);
    }
  );

  it.each(['Assignment', 'Group', 'InstrumentRecord', 'InstrumentRepo', 'Session', 'Subject', 'User'])(
    'should accept %s',
    (subject) => {
      expect($GroupScopableSubjectName.safeParse(subject).success).toBe(true);
    }
  );
});

describe('$UserPermission', () => {
  it('should accept a grant confined to a group on a resource that has one', () => {
    expect($UserPermission.safeParse({ action: 'read', groupId: 'group-1', subject: 'Subject' }).success).toBe(true);
  });

  it('should accept an unscoped grant on every resource', () => {
    expect($UserPermission.safeParse({ action: 'manage', groupId: null, subject: 'all' }).success).toBe(true);
  });

  it.each(['all', 'Instrument'])('should reject a grant confined to a group on %s', (subject) => {
    const result = $UserPermission.safeParse({ action: 'read', groupId: 'group-1', subject });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual(['groupId']);
  });

  it('should reject an omitted scope, so a forgotten group is never read as every group', () => {
    expect($UserPermission.safeParse({ action: 'read', subject: 'Subject' }).success).toBe(false);
  });
});

describe('isGrantablePermission', () => {
  it.each(['create', 'delete', 'manage', 'update'] as const)(
    'should refuse %s User, since every route that writes a user is admin-only',
    (action) => {
      expect(isGrantablePermission({ action, subject: 'User' })).toBe(false);
    }
  );

  it('should allow read User, which scopes the user list a grantee sees', () => {
    expect(isGrantablePermission({ action: 'read', subject: 'User' })).toBe(true);
  });

  it('should allow a write on any other resource', () => {
    expect(isGrantablePermission({ action: 'update', subject: 'Subject' })).toBe(true);
  });
});

describe('$Json', () => {
  it('should accept a value nesting arrays and records of JSON literals', () => {
    expect($Json.safeParse({ a: [1, 'two', true, null, { b: false }] }).success).toBe(true);
  });
  it('should reject a value containing a function', () => {
    expect($Json.safeParse({ a: () => null }).success).toBe(false);
  });
});

describe('resolveActiveLanguage', () => {
  it('should keep a reader on their language while the instance still offers it', () => {
    expect(resolveActiveLanguage('fr', ['en', 'fr'])).toBe('fr');
  });

  it('should move a reader off a deactivated language, which the toggle no longer offers a way out of', () => {
    expect(resolveActiveLanguage('es', ['en', 'fr'])).toBe('en');
  });

  it('should fall back to the first offered language, so the result does not depend on click order', () => {
    expect(resolveActiveLanguage('en', ['fr', 'es'])).toBe('fr');
  });
});

describe('$LicenseIdentifier', () => {
  it('should accept a recognized SPDX identifier', () => {
    expect($LicenseIdentifier.safeParse('MIT').success).toBe(true);
  });
  it('should reject a string not in the license map', () => {
    expect($LicenseIdentifier.safeParse('NOT-A-LICENSE').success).toBe(false);
  });
});

describe('$RegexString', () => {
  it('should accept a string that compiles as a regular expression', () => {
    expect($RegexString.safeParse('^[a-z]+$').success).toBe(true);
  });
  it('should reject a string that is not a valid regular expression', () => {
    expect($RegexString.safeParse('(unterminated').success).toBe(false);
  });
});

describe('toInstrumentAuthoringLanguage', () => {
  it('should pass through an interface language that instruments may be authored in', () => {
    expect(toInstrumentAuthoringLanguage('fr')).toBe('fr');
  });
  it('should fall back to English for an interface language instruments cannot be authored in', () => {
    expect(toInstrumentAuthoringLanguage('es')).toBe('en');
  });
});
