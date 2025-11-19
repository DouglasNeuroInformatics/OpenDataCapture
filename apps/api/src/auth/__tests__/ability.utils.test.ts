import { describe, expect, it, vi } from 'vitest';

import { accessibleQuery } from '../ability.utils';

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
