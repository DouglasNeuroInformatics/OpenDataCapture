import { z } from 'zod/v4';

import { $Group } from '../group/group';
import { $User } from '../user/user';

export type $AuditLogAction = z.infer<typeof $AuditLogAction>;
export const $AuditLogAction = z.enum(['CREATE', 'UPDATE', 'DELETE', 'LOGIN']);

export type $AuditLogEntity = z.infer<typeof $AuditLogEntity>;
export const $AuditLogEntity = z.enum([
  'ASSIGNMENT',
  'GROUP',
  'INSTRUMENT_RECORD',
  'INSTRUMENT',
  'SUBJECT',
  'SESSION',
  'USER'
]);

/** The number of audit logs shown per page, matching the page size used by the client's data table. */
export const AUDIT_LOGS_PAGE_SIZE = 10;

/** Upper bound on `limit`, so a single request can never load an unbounded slice of the collection. */
export const AUDIT_LOGS_MAX_PAGE_SIZE = 1000;

/** The filters that live in the client's URL. Pagination and sorting are not included, because the
 * data table always mounts at the first page in its unsorted state and cannot be told otherwise. */
export type $AuditLogsQuerySearchParams = z.infer<typeof $AuditLogsQuerySearchParams>;
export const $AuditLogsQuerySearchParams = z.object({
  action: $AuditLogAction.optional(),
  entity: $AuditLogEntity.optional(),
  groupId: z.string().optional(),
  userId: z.string().optional()
});

export type $AuditLogsQueryParams = z.infer<typeof $AuditLogsQueryParams>;
export const $AuditLogsQueryParams = $AuditLogsQuerySearchParams.extend({
  limit: z.coerce.number().int().positive().max(AUDIT_LOGS_MAX_PAGE_SIZE).default(AUDIT_LOGS_PAGE_SIZE),
  page: z.coerce.number().int().positive().default(1),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

export type $AuditLog = z.infer<typeof $AuditLog>;
export const $AuditLog = z.object({
  action: $AuditLogAction,
  entity: $AuditLogEntity,
  group: $Group.pick({ name: true }).nullish(),
  id: z.string(),
  timestamp: z.int(),
  user: $User.pick({ username: true }).nullish()
});

export type $AuditLogsPage = z.infer<typeof $AuditLogsPage>;
export const $AuditLogsPage = z.object({
  data: z.array($AuditLog),
  pageCount: z.int().nonnegative(),
  total: z.int().nonnegative()
});
