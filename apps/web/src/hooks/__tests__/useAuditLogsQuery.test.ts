import { AUDIT_LOGS_MAX_PAGE_SIZE, AUDIT_LOGS_PAGE_SIZE } from '@opendatacapture/schemas/audit';
import { QueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { auditLogsQueryOptions, fetchAllAuditLogs } from '../useAuditLogsQuery';

vi.mock('axios');

// Runs the options through a real client rather than invoking `queryFn` directly, so the test
// exercises them the way the route does.
const runQuery = (params?: Parameters<typeof auditLogsQueryOptions>[0]) =>
  new QueryClient().fetchQuery(auditLogsQueryOptions(params));

// eslint-disable-next-line @typescript-eslint/unbound-method -- a vitest mock, never invoked as a method
const get = vi.mocked(axios).get;

const page = (data: unknown[], pageCount: number, total: number) => ({
  data: { data, pageCount, total }
});

const log = (id: string) => ({
  action: 'LOGIN' as const,
  entity: 'USER' as const,
  group: null,
  id,
  timestamp: 1,
  user: null
});

describe('auditLogsQueryOptions', () => {
  beforeEach(() => {
    get.mockReset();
  });

  it('should request a single page rather than the whole collection', async () => {
    get.mockResolvedValueOnce(page([], 0, 0));
    await runQuery();
    expect(get).toHaveBeenCalledWith('/v1/audit/logs', { params: { limit: AUDIT_LOGS_PAGE_SIZE } });
  });

  it('should forward the page, sort order and filters to the server', async () => {
    get.mockResolvedValueOnce(page([], 0, 0));
    await runQuery({ params: { action: 'LOGIN', page: 3, sortOrder: 'asc' } });
    expect(get).toHaveBeenCalledWith('/v1/audit/logs', {
      params: { action: 'LOGIN', limit: AUDIT_LOGS_PAGE_SIZE, page: 3, sortOrder: 'asc' }
    });
  });

  it('should key the cache on every parameter, so paging does not serve a stale page', () => {
    const first = auditLogsQueryOptions({ params: { page: 1 } }).queryKey;
    const second = auditLogsQueryOptions({ params: { page: 2 } }).queryKey;
    expect(first).not.toStrictEqual(second);
  });
});

describe('fetchAllAuditLogs', () => {
  beforeEach(() => {
    get.mockReset();
  });

  it('should walk every page so the download is not limited to the page on screen', async () => {
    get
      .mockResolvedValueOnce(page([log('a'), log('b')], 3, 5))
      .mockResolvedValueOnce(page([log('c'), log('d')], 3, 5))
      .mockResolvedValueOnce(page([log('e')], 3, 5));
    const logs = await fetchAllAuditLogs({});
    expect(logs.map(({ id }) => id)).toStrictEqual(['a', 'b', 'c', 'd', 'e']);
    expect(get.mock.calls.map(([, config]) => (config as any).params.page)).toStrictEqual([1, 2, 3]);
  });

  it('should request the largest page the server allows, to bound the number of round trips', async () => {
    get.mockResolvedValueOnce(page([], 1, 0));
    await fetchAllAuditLogs({});
    expect(get.mock.lastCall?.[1]).toMatchObject({
      params: { limit: AUDIT_LOGS_MAX_PAGE_SIZE }
    });
  });

  it('should carry the active filters into every page of the download', async () => {
    get.mockResolvedValueOnce(page([log('a')], 2, 2)).mockResolvedValueOnce(page([log('b')], 2, 2));
    await fetchAllAuditLogs({ entity: 'SUBJECT', groupId: 'group-1' });
    for (const [, config] of get.mock.calls) {
      expect((config as any).params).toMatchObject({ entity: 'SUBJECT', groupId: 'group-1' });
    }
  });
});
