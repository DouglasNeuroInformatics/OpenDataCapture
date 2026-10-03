import { describe, expect, it } from 'vitest';

import { selectAdministrableInstruments } from '../administrable-instruments';

const archivedSeries = { archivedAt: new Date('2024-06-01'), id: 'archived-series', kind: 'SERIES' as const };
const activeSeries = { archivedAt: null, id: 'active-series', kind: 'SERIES' as const };
const form = { id: 'form', kind: 'FORM' as const };

const ids = (instruments: { id: string }[]) => instruments.map(({ id }) => id);

describe('selectAdministrableInstruments', () => {
  it('should drop an archived series the group has opted into, since archiving retires it from new sessions', () => {
    const group = { accessibleInstrumentIds: ['archived-series', 'active-series', 'form'] };
    expect(ids(selectAdministrableInstruments([archivedSeries, activeSeries, form], group))).toEqual([
      'active-series',
      'form'
    ]);
  });

  it('should keep only what the current group has opted into', () => {
    expect(ids(selectAdministrableInstruments([activeSeries, form], { accessibleInstrumentIds: ['form'] }))).toEqual([
      'form'
    ]);
  });

  it('should drop an archived series even without a current group, which otherwise admits everything', () => {
    expect(ids(selectAdministrableInstruments([archivedSeries, activeSeries, form], null))).toEqual([
      'active-series',
      'form'
    ]);
  });
});
