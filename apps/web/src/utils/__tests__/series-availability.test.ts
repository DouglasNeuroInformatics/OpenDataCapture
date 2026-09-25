import { describe, expect, it } from 'vitest';

import { buildSeriesAvailability } from '../series-availability';

const currentGroup = { id: 'group-1', name: 'Depression Clinic' };

describe('buildSeriesAvailability', () => {
  it('should report nothing for a scalar instrument, which no group owns', () => {
    expect(buildSeriesAvailability({ currentGroup, instrumentKind: 'FORM', seriesGroupId: null })).toBeNull();
  });

  it('should report every group for a series with no owning group, so a shared series reads as shared', () => {
    expect(buildSeriesAvailability({ currentGroup, instrumentKind: 'SERIES', seriesGroupId: null })).toEqual({
      kind: 'all'
    });
  });

  it('should name the owning group when the series belongs to the group being managed', () => {
    expect(buildSeriesAvailability({ currentGroup, instrumentKind: 'SERIES', seriesGroupId: 'group-1' })).toEqual({
      kind: 'group',
      name: 'Depression Clinic'
    });
  });

  // Naming the current group here would label another group's series as this one's.
  it('should leave the name empty for a series owned by some other group', () => {
    expect(buildSeriesAvailability({ currentGroup, instrumentKind: 'SERIES', seriesGroupId: 'group-2' })).toEqual({
      kind: 'group',
      name: null
    });
  });

  it('should leave the name empty when no group is selected', () => {
    expect(buildSeriesAvailability({ instrumentKind: 'SERIES', seriesGroupId: 'group-1' })).toEqual({
      kind: 'group',
      name: null
    });
  });
});
