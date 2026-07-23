import { $AuditLogsPage, AUDIT_LOGS_MAX_PAGE_SIZE, AUDIT_LOGS_PAGE_SIZE } from '@opendatacapture/schemas/audit';
import type { $AuditLog, $AuditLogsQueryParams, $AuditLogsQuerySearchParams } from '@opendatacapture/schemas/audit';
import { keepPreviousData, queryOptions, useQuery } from '@tanstack/react-query';
import axios from 'axios';

type AuditLogsQueryParams = $AuditLogsQuerySearchParams & {
  page?: number;
  sortOrder?: 'asc' | 'desc';
};

const fetchAuditLogs = async (params: Partial<$AuditLogsQueryParams>) => {
  const response = await axios.get('/v1/audit/logs', { params });
  return $AuditLogsPage.parse(response.data);
};

export const auditLogsQueryOptions = ({ params = {} }: { params?: AuditLogsQueryParams } = {}) => {
  return queryOptions({
    placeholderData: keepPreviousData,
    queryFn: () => fetchAuditLogs({ limit: AUDIT_LOGS_PAGE_SIZE, ...params }),
    queryKey: ['audit-logs', params]
  });
};

export function useAuditLogsQuery({ params = {} }: { params?: AuditLogsQueryParams } = {}) {
  return useQuery(auditLogsQueryOptions({ params }));
}

/**
 * Every log matching the current filters, for the download action. Requested a page at a time so a
 * single response is never unbounded, at the largest page size the server permits.
 */
export async function fetchAllAuditLogs(search: $AuditLogsQuerySearchParams): Promise<$AuditLog[]> {
  const logs: $AuditLog[] = [];
  let page = 1;
  let pageCount = 1;
  while (page <= pageCount) {
    const result = await fetchAuditLogs({ ...search, limit: AUDIT_LOGS_MAX_PAGE_SIZE, page });
    logs.push(...result.data);
    pageCount = result.pageCount;
    page++;
  }
  return logs;
}
