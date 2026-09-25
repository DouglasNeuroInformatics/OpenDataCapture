import { describe, expect, it } from 'vitest';

import {
  $GroupScopableSubjectName,
  $Json,
  $LicenseIdentifier,
  $RegexString,
  $UserPermission,
  isGrantablePermission,
  toInstrumentAuthoringLanguage
} from './core.js';

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
