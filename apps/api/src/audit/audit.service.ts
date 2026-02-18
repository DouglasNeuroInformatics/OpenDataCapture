import { InjectModel } from '@douglasneuroinformatics/libnest';
import type { Model } from '@douglasneuroinformatics/libnest';
import { Injectable } from '@nestjs/common';
import type { $AuditLog, $AuditLogsQuerySearchParams } from '@opendatacapture/schemas/audit';

@Injectable()
export class AuditService {
  constructor(@InjectModel('AuditLog') private readonly auditLogModel: Model<'AuditLog'>) {}

  async find({ action, entity, groupId, userId }: $AuditLogsQuerySearchParams): Promise<$AuditLog[]> {
    return this.auditLogModel.findMany({
      select: {
        action: true,
        entity: true,
        group: { select: { name: true } },
        id: true,
        timestamp: true,
        user: { select: { username: true } }
      },
      where: {
        action,
        entity,
        groupId,
        userId
      }
    });
  }
}
