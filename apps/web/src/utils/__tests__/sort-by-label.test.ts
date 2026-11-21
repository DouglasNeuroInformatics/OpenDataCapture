import { describe, expect, it } from 'vitest';

import { sortByLabel } from '../sort-by-label';

describe('sortByLabel', () => {
  it('should order entries alphabetically by their label, not by the order they were written in', () => {
    const entries = [{ label: 'Uploader' }, { label: 'Remote Assignments' }, { label: 'Interface' }];
    expect(sortByLabel(entries).map(({ label }) => label)).toStrictEqual([
      'Interface',
      'Remote Assignments',
      'Uploader'
    ]);
  });

  it('should place an accented letter beside its base letter, so French labels sort as a reader expects', () => {
    const entries = [{ label: 'Téléversement' }, { label: 'Tâches à distance' }];
    expect(sortByLabel(entries).map(({ label }) => label)).toStrictEqual(['Tâches à distance', 'Téléversement']);
  });

  it('should leave the given list in its original order', () => {
    const entries = [{ label: 'B' }, { label: 'A' }];
    sortByLabel(entries);
    expect(entries.map(({ label }) => label)).toStrictEqual(['B', 'A']);
  });
});
