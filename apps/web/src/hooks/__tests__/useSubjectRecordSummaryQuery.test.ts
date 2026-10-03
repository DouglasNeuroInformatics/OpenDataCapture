import { QueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { subjectRecordSummaryQueryOptions } from '../useSubjectRecordSummaryQuery';

vi.mock('axios');

const runQuery = (groupId?: string) =>
  new QueryClient().fetchQuery(subjectRecordSummaryQueryOptions({ params: { groupId } }));

// eslint-disable-next-line @typescript-eslint/unbound-method -- a vitest mock, never invoked as a method
const get = vi.mocked(axios).get;

describe('subjectRecordSummaryQueryOptions', () => {
  beforeEach(() => {
    get.mockReset();
  });

  it('should scope the summary to the current group, so the counts match the subjects listed beside them', async () => {
    get.mockResolvedValueOnce({ data: [] });
    await runQuery('group-1');
    expect(get).toHaveBeenCalledWith('/v1/instrument-records/summary/by-subject', { params: { groupId: 'group-1' } });
  });

  it('should coerce the collection date, so the column can compare it as a date rather than a string', async () => {
    get.mockResolvedValueOnce({
      data: [{ lastCollectedAt: '2025-02-02T00:00:00.000Z', recordCount: 3, subjectId: 'subject-1' }]
    });
    const [summary] = await runQuery('group-1');
    expect(summary!.lastCollectedAt).toStrictEqual(new Date('2025-02-02T00:00:00.000Z'));
  });

  // A subject the group has never collected from still belongs in the list, so the date is nullable
  // rather than the row being absent.
  it('should accept a null collection date for a subject with no records yet', async () => {
    get.mockResolvedValueOnce({ data: [{ lastCollectedAt: null, recordCount: 0, subjectId: 'subject-1' }] });
    await expect(runQuery('group-1')).resolves.toStrictEqual([
      { lastCollectedAt: null, recordCount: 0, subjectId: 'subject-1' }
    ]);
  });

  it('should reject a negative record count, so nothing unparsed reaches the table', async () => {
    get.mockResolvedValueOnce({ data: [{ lastCollectedAt: null, recordCount: -1, subjectId: 'subject-1' }] });
    await expect(runQuery('group-1')).rejects.toThrow();
  });

  it('should key the cache on the group, so switching group does not serve the previous group counts', () => {
    expect(subjectRecordSummaryQueryOptions({ params: { groupId: 'group-1' } }).queryKey).not.toStrictEqual(
      subjectRecordSummaryQueryOptions({ params: { groupId: 'group-2' } }).queryKey
    );
  });
});
