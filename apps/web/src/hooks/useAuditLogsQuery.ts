import { $AuditLog, $AuditLogsQuerySearchParams } from '@opendatacapture/schemas/audit';
import { queryOptions, useSuspenseQuery } from '@tanstack/react-query';
import axios from 'axios';
import { z } from 'zod/v4';

export const auditLogsQueryOptions = ({ search = {} }: { search?: $AuditLogsQuerySearchParams } = {}) => {
  return queryOptions({
    queryFn: async () => {
      const response = await axios.get(`/v1/audit/logs?${new URLSearchParams(search).toString()}`);
      return z.array($AuditLog).parse(response.data);
    },
    queryKey: ['audit-logs', JSON.stringify(search)]
  });
};

export function useAuditLogsQuery({ search = {} }: { search?: $AuditLogsQuerySearchParams } = {}) {
  return useSuspenseQuery(auditLogsQueryOptions({ search }));
}
