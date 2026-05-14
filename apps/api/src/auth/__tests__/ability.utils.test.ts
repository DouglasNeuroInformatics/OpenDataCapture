import { describe, expect, it, vi } from 'vitest';

import { accessibleQuery, createAppAbility, forcedAppSubject } from '../ability.utils';

const accessibleBy = vi.hoisted(() => vi.fn());

vi.mock('@casl/prisma/runtime', () => ({
  createAccessibleByFactory: () => accessibleBy
}));

describe('accessibleQuery', () => {
  it('should return an empty object if ability is undefined', () => {
    expect(accessibleQuery(undefined, 'manage', 'User')).toStrictEqual({});
    expect(accessibleBy).not.toHaveBeenCalled();
  });
  it('should call accessibleBy with the correct parameters and return the result of accessibleBy for the model', () => {
    accessibleBy.mockReturnValueOnce({
      User: 'QUERY'
    });
    const ability = vi.fn();
    expect(accessibleQuery(ability as any, 'manage', 'User')).toStrictEqual('QUERY');
    expect(accessibleBy).toHaveBeenCalledExactlyOnceWith(ability, 'manage');
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
