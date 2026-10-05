import type { TranslatedInstrumentInfo } from '@opendatacapture/schemas/instrument';
import { describe, expect, it } from 'vitest';

import { getEditionOptions, selectLatestEditions } from '../instrument-editions';

const instrument = (id: string, name: string, edition: number) => ({ id, internal: { edition, name } });

const scalar = (id: string, name: string, edition: number) =>
  ({
    details: { title: name },
    id,
    internal: { edition, name },
    kind: 'FORM'
  }) as unknown as TranslatedInstrumentInfo;

const series = (id: string) =>
  ({ details: { title: id }, id, kind: 'SERIES', seriesItems: [] }) as unknown as TranslatedInstrumentInfo;

describe('selectLatestEditions', () => {
  it('should keep only the highest edition of each instrument, whatever order the editions arrive in', () => {
    const result = selectLatestEditions([
      instrument('hq-2', 'HQ', 2),
      instrument('hq-1', 'HQ', 1),
      instrument('bdi-1', 'BDI', 1)
    ]);
    expect(result.map(({ id }) => id)).toEqual(['hq-2', 'bdi-1']);
  });
});

describe('getEditionOptions', () => {
  it('should offer every edition sharing the selected instrument’s internal name', () => {
    const infos = [scalar('bprs-2', 'BPRS', 2), scalar('bprs-1', 'BPRS', 1)];
    expect(getEditionOptions(infos, 'bprs-2', 'Edition')).toStrictEqual({
      'bprs-1': 'Edition 1',
      'bprs-2': 'Edition 2'
    });
  });

  it('should order the options by edition rather than by the order the catalog returned them', () => {
    const infos = [scalar('bprs-3', 'BPRS', 3), scalar('bprs-1', 'BPRS', 1), scalar('bprs-2', 'BPRS', 2)];
    expect(Object.values(getEditionOptions(infos, 'bprs-1', 'Edition'))).toStrictEqual([
      'Edition 1',
      'Edition 2',
      'Edition 3'
    ]);
  });

  // Editions are keyed on `internal.name`, so a different instrument that happens to be in the
  // catalog alongside must not appear as an edition of this one.
  it('should exclude instruments with a different internal name', () => {
    const infos = [scalar('bprs-1', 'BPRS', 1), scalar('hq-1', 'HQ', 1)];
    expect(getEditionOptions(infos, 'bprs-1', 'Edition')).toStrictEqual({ 'bprs-1': 'Edition 1' });
  });

  it('should offer nothing for a series, which has no internal name to have editions of', () => {
    expect(getEditionOptions([series('series-1')], 'series-1', 'Edition')).toStrictEqual({});
  });

  it('should offer nothing when the instrument is not in the catalog', () => {
    expect(getEditionOptions([scalar('bprs-1', 'BPRS', 1)], 'missing', 'Edition')).toStrictEqual({});
  });

  it('should offer nothing before an instrument has been chosen', () => {
    expect(getEditionOptions([scalar('bprs-1', 'BPRS', 1)], null, 'Edition')).toStrictEqual({});
  });
});
