import { InjectModel } from '@douglasneuroinformatics/libnest';
import type { Model } from '@douglasneuroinformatics/libnest';
import { Injectable } from '@nestjs/common';
import type { $AuditLogsPage, $AuditLogsQueryParams } from '@opendatacapture/schemas/audit';

@Injectable()
export class AuditService {
  constructor(@InjectModel('AuditLog') private readonly auditLogModel: Model<'AuditLog'>) {}

  async find({
    action,
    entity,
    groupId,
    limit,
    page,
    sortOrder,
    userId
  }: $AuditLogsQueryParams): Promise<$AuditLogsPage> {
    const where = { action, entity, groupId, userId };
    const [data, total] = await Promise.all([
      this.auditLogModel.findMany({
        orderBy: { timestamp: sortOrder },
        select: {
          action: true,
          entity: true,
          group: { select: { name: true } },
          id: true,
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
