import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { useSearch } from '../useSearch';

type Person = { firstName: string; lastName: string };

const PEOPLE: Person[] = [
  { firstName: 'Ada', lastName: 'Lovelace' },
  { firstName: 'Alan', lastName: 'Turing' },
  { firstName: 'Grace', lastName: 'Hopper' }
];

describe('useSearch', () => {
  afterEach(cleanup);

  it('should return every item before anything is searched', () => {
    const { result } = renderHook(() => useSearch(PEOPLE, (person) => person.firstName));
    expect(result.current.filteredData).toEqual(PEOPLE);
  });

  it('should filter on the selected string, ignoring case', () => {
    const { result } = renderHook(() => useSearch(PEOPLE, (person) => person.firstName));
    act(() => result.current.setSearchTerm('AL'));
    expect(result.current.searchTerm).toBe('AL');
    expect(result.current.filteredData).toEqual([{ firstName: 'Alan', lastName: 'Turing' }]);
  });

  it('should filter on the string a select function derives from each item', () => {
    const { result } = renderHook(() => useSearch(PEOPLE, (person) => `${person.firstName} ${person.lastName}`));
    act(() => result.current.setSearchTerm('e h'));
    expect(result.current.filteredData).toEqual([{ firstName: 'Grace', lastName: 'Hopper' }]);
  });

  it('should reapply the current search when the data changes', () => {
    const { rerender, result } = renderHook(({ data }) => useSearch(data, (person) => person.lastName), {
      initialProps: { data: PEOPLE }
    });
    act(() => result.current.setSearchTerm('ing'));
    const added = { firstName: 'Margaret', lastName: 'Hamilton-Ingram' };
    rerender({ data: [...PEOPLE, added] });
    expect(result.current.filteredData).toEqual([{ firstName: 'Alan', lastName: 'Turing' }, added]);
  });
});
