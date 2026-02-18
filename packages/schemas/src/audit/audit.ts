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

export type $AuditLogsQuerySearchParams = z.infer<typeof $AuditLogsQuerySearchParams>;
export const $AuditLogsQuerySearchParams = z.object({
  action: $AuditLogAction.optional(),
  entity: $AuditLogEntity.optional(),
  groupId: z.string().optional(),
  userId: z.string().optional()
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
