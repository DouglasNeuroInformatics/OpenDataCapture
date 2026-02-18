import { InjectModel } from '@douglasneuroinformatics/libnest';
import type { Model } from '@douglasneuroinformatics/libnest';
import { Injectable } from '@nestjs/common';
import type { $AuditLogAction, $AuditLogEntity } from '@opendatacapture/schemas/audit';

@Injectable()
export class AuditLogger {
  constructor(@InjectModel('AuditLog') private readonly auditLogModel: Model<'AuditLog'>) {}

  async log(
    action: $AuditLogAction,
    entity: $AuditLogEntity,
    params: { groupId: null | string; userId: string }
  ): Promise<void> {
    await this.auditLogModel.create({
      data: {
        action,
        entity,
        group: params.groupId ? { connect: { id: params.groupId } } : undefined,
        timestamp: Date.now(),
        user: {
          connect: {
            id: params.userId
          }
        }
      }
    });
  }
}
