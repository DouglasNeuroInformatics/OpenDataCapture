import { QueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { instrumentRecordSummaryQueryOptions } from '../useInstrumentRecordSummaryQuery';

vi.mock('axios');

const runQuery = (params: { bySeries?: boolean; groupId?: string }) =>
  new QueryClient().fetchQuery(instrumentRecordSummaryQueryOptions({ params }));

// eslint-disable-next-line @typescript-eslint/unbound-method -- a vitest mock, never invoked as a method
const get = vi.mocked(axios).get;

const summary = (overrides: { [key: string]: unknown } = {}) => ({
  instrumentId: 'instrument-1',
  lastCollectedAt: null,
  recordCount: 2,
  subjectCount: 1,
  ...overrides
});

describe('instrumentRecordSummaryQueryOptions', () => {
  beforeEach(() => {
    get.mockReset();
  });

  it('should summarize by instrument by default, which is what the hub lists', async () => {
    get.mockResolvedValueOnce({ data: [] });
    await runQuery({ groupId: 'group-1' });
    expect(get).toHaveBeenCalledWith('/v1/instrument-records/summary/by-instrument', {
      params: { groupId: 'group-1' }
    });
  });

  // A series collects through the instruments it composes, so its totals come from a different
  // aggregation rather than from filtering the per-instrument one.
  it('should summarize by series when asked, since a series owns no records under its own id', async () => {
    get.mockResolvedValueOnce({ data: [] });
    await runQuery({ bySeries: true, groupId: 'group-1' });
    expect(get).toHaveBeenCalledWith('/v1/instrument-records/summary/by-series', { params: { groupId: 'group-1' } });
  });

  it('should send only the group, so the series flag stays a client-side choice of endpoint', async () => {
    get.mockResolvedValueOnce({ data: [] });
    await runQuery({ bySeries: true, groupId: 'group-1' });
    expect(get.mock.lastCall?.[1]).toStrictEqual({ params: { groupId: 'group-1' } });
  });

  it('should coerce the collection date, so the column can compare it as a date rather than a string', async () => {
    get.mockResolvedValueOnce({ data: [summary({ lastCollectedAt: '2025-02-02T00:00:00.000Z' })] });
    const [parsed] = await runQuery({ groupId: 'group-1' });
    expect(parsed!.lastCollectedAt).toStrictEqual(new Date('2025-02-02T00:00:00.000Z'));
  });

  // An instrument the caller may read but has never collected belongs in the list with no date.
  it('should accept a null collection date for an instrument never collected', async () => {
    get.mockResolvedValueOnce({ data: [summary({ recordCount: 0, subjectCount: 0 })] });
    await expect(runQuery({ groupId: 'group-1' })).resolves.toStrictEqual([
      { instrumentId: 'instrument-1', lastCollectedAt: null, recordCount: 0, subjectCount: 0 }
    ]);
  });

  it('should reject a fractional subject count, since subjects are counted not measured', async () => {
    get.mockResolvedValueOnce({ data: [summary({ subjectCount: 1.5 })] });
    await expect(runQuery({ groupId: 'group-1' })).rejects.toThrow();
  });

  it('should key the cache on the group, so switching group does not serve the previous group counts', () => {
    expect(instrumentRecordSummaryQueryOptions({ params: { groupId: 'group-1' } }).queryKey).not.toStrictEqual(
      instrumentRecordSummaryQueryOptions({ params: { groupId: 'group-2' } }).queryKey
    );
  });

  // Both summaries are fetched on the same page, so sharing a key would serve one as the other.
  it('should key the cache on the series flag, so the two summaries do not share an entry', () => {
    expect(instrumentRecordSummaryQueryOptions({ params: { groupId: 'group-1' } }).queryKey).not.toStrictEqual(
      instrumentRecordSummaryQueryOptions({ params: { bySeries: true, groupId: 'group-1' } }).queryKey
    );
  });
});
