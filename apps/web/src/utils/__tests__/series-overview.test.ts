import { describe, expect, it } from 'vitest';

import { sortSeriesOverviewRows } from '../series-overview';

const titles = (rows: { title: string }[]) => rows.map(({ title }) => title);

describe('sortSeriesOverviewRows', () => {
  it('should list archived series after every active one, so what is still in use comes first', () => {
    const rows = [
      { archivedAt: new Date('2024-06-01'), groupName: 'Alpha', title: 'Retired' },
      { archivedAt: null, groupName: 'Zeta', title: 'Current' }
    ];
    expect(titles(sortSeriesOverviewRows(rows))).toEqual(['Current', 'Retired']);
  });

  it('should keep each group together, with the series every group shares ahead of any group', () => {
    const rows = [
      { groupName: 'Psychosis Lab', title: 'A' },
      { groupName: null, title: 'Shared' },
      { groupName: 'Depression Clinic', title: 'B' }
    ];
    expect(titles(sortSeriesOverviewRows(rows))).toEqual(['Shared', 'B', 'A']);
  });

  it('should order a group series by title', () => {
    const rows = [
      { groupName: 'Depression Clinic', title: 'Intake' },
      { groupName: 'Depression Clinic', title: 'Follow-up' }
    ];
    expect(titles(sortSeriesOverviewRows(rows))).toEqual(['Follow-up', 'Intake']);
  });
});
