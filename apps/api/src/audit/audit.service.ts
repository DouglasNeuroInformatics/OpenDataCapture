import { InjectModel } from '@douglasneuroinformatics/libnest';
import type { Model } from '@douglasneuroinformatics/libnest';
import { Injectable } from '@nestjs/common';
import type { $AuditLogsPage, $AuditLogsQueryParams, $AuditLogsSortBy } from '@opendatacapture/schemas/audit';

type SortOrder = $AuditLogsQueryParams['sortOrder'];

/**
 * The trailing id makes the order total, since Mongo may otherwise return tied rows in a different
 * order per page, repeating some rows and skipping others.
 */
const getOrderBy = (sortBy: $AuditLogsSortBy, sortOrder: SortOrder) => {
  const orderBy = {
    action: { action: sortOrder },
    entity: { entity: sortOrder },
    group: { group: { name: sortOrder } },
    timestamp: { timestamp: sortOrder },
    user: { user: { username: sortOrder } }
  }[sortBy];
  return [orderBy, { id: 'desc' as const }];
};

@Injectable()
export class AuditService {
  constructor(@InjectModel('AuditLog') private readonly auditLogModel: Model<'AuditLog'>) {}

  async find({
    action,
    entity,
    groupId,
    limit,
    page,
    sortBy,
    sortOrder,
    userId
  }: $AuditLogsQueryParams): Promise<$AuditLogsPage> {
    const where = { action, entity, groupId, userId };
    const [data, total] = await Promise.all([
      this.auditLogModel.findMany({
        orderBy: getOrderBy(sortBy, sortOrder),
        select: {
          action: true,
          entity: true,
          group: { select: { name: true } },
          id: true,
          metadata: true,
          timestamp: true,
          user: { select: { username: true } }
        },
        skip: (page - 1) * limit,
        take: limit,
        where
      }),
      this.auditLogModel.count({ where })
    ]);
    return { data, pageCount: Math.ceil(total / limit), total };
  }
}
