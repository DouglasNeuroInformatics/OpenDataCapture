import { describe, expect, it } from 'vitest';

import { readServerSort } from '../data-table';

const COLUMNS = ['name', 'date'] as const;

describe('readServerSort', () => {
  it('should read the column and direction a sort click named', () => {
    expect(readServerSort([{ desc: true, id: 'date' }], COLUMNS)).toEqual({ sortBy: 'date', sortOrder: 'desc' });
    expect(readServerSort([{ desc: false, id: 'name' }], COLUMNS)).toEqual({ sortBy: 'name', sortOrder: 'asc' });
  });

  it('should fail loudly on a column the endpoint cannot order by, rather than ignore the click', () => {
    expect(() => readServerSort([{ desc: false, id: 'messages' }], COLUMNS)).toThrow('messages');
  });
});
