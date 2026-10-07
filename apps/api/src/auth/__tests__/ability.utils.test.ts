import { ForbiddenError } from '@casl/ability';
import { describe, expect, it } from 'vitest';

import { accessibleQuery, createAppAbility, forcedAppSubject } from '../ability.utils';

describe('accessibleQuery', () => {
  it('should return an empty object if ability is undefined', () => {
    expect(accessibleQuery(undefined, 'manage', 'User')).toStrictEqual({});
  });

  it('should return an empty object for an unconditional rule, since it restricts nothing', () => {
    const ability = createAppAbility([{ action: 'manage', subject: 'all' }]);
    expect(accessibleQuery(ability, 'read', 'Subject')).toStrictEqual({});
  });

  it('should return the conditions of the rules granting the action on the model', () => {
    const ability = createAppAbility([
      { action: 'read', conditions: { groupIds: { hasSome: ['group-1'] } }, subject: 'Subject' },
      { action: 'read', conditions: { groupId: { in: ['group-1'] } }, subject: 'Session' }
    ]);
    expect(accessibleQuery(ability, 'read', 'Subject')).toStrictEqual({ OR: [{ groupIds: { hasSome: ['group-1'] } }] });
  });

  it('should throw a ForbiddenError when no rule grants the action on the model, rather than filter', () => {
    const ability = createAppAbility([{ action: 'read', subject: 'Session' }]);
    expect(() => accessibleQuery(ability, 'read', 'Subject')).toThrow(ForbiddenError);
    expect(() => accessibleQuery(ability, 'read', 'Subject')).toThrow(`It's not allowed to run "read" on "Subject"`);
  });

  it('should throw when an unconditional cannot rule outranks every can rule', () => {
    const ability = createAppAbility([
      { action: 'read', conditions: { groupIds: { hasSome: ['group-1'] } }, subject: 'Subject' },
      { action: 'read', inverted: true, subject: 'Subject' }
    ]);
    expect(() => accessibleQuery(ability, 'read', 'Subject')).toThrow(ForbiddenError);
  });

  it('should throw when the only rules for the model are conditional cannot rules', () => {
    const ability = createAppAbility([
      { action: 'read', conditions: { groupIds: { hasSome: ['group-1'] } }, inverted: true, subject: 'Subject' }
    ]);
    expect(() => accessibleQuery(ability, 'read', 'Subject')).toThrow(ForbiddenError);
  });

  // `ability.can` refuses here, since CASL 7 reads a cannot rule matching everything as unconditional,
  // but the query is a filter that matches nothing, which is what @casl/prisma 1 returned too.
  it('should filter rather than throw when a cannot rule matching everything outranks a can rule', () => {
    const ability = createAppAbility([
      { action: 'read', conditions: { groupIds: { hasSome: ['group-1'] } }, subject: 'Subject' },
      { action: 'read', conditions: {}, inverted: true, subject: 'Subject' }
    ]);
    expect(ability.can('read', 'Subject')).toBe(false);
    expect(accessibleQuery(ability, 'read', 'Subject')).toStrictEqual({
      OR: [{ AND: [{ groupIds: { hasSome: ['group-1'] } }, { NOT: {} }] }]
    });
  });
});

describe('forcedAppSubject', () => {
  it('should limit access by groupId when ability is scoped to a group', () => {
    const ability = createAppAbility([
      { action: 'create', conditions: { groupId: 'group-1' }, subject: 'InstrumentRecordFile' }
    ]);

    expect(ability.can('create', forcedAppSubject('InstrumentRecordFile', { groupId: 'group-1' }))).toBe(true);
    expect(ability.can('create', forcedAppSubject('InstrumentRecordFile', { groupId: 'group-2' }))).toBe(false);
  });

  it('should deny access when no groupId is provided and ability requires one', () => {
    const ability = createAppAbility([
      { action: 'create', conditions: { groupId: 'group-1' }, subject: 'InstrumentRecordFile' }
    ]);

    expect(ability.can('create', forcedAppSubject('InstrumentRecordFile', {}))).toBe(false);
  });
});
