import { InjectModel } from '@douglasneuroinformatics/libnest';
import type { Model } from '@douglasneuroinformatics/libnest';
import { Injectable } from '@nestjs/common';
import type { AuditedAction, AuditedEntity } from '@opendatacapture/schemas/audit';

type AuditLogParams = { groupId: null | string; metadata?: { [key: string]: string }; userId: string };

type UpdateAuditedEntity = {
  [TEntity in AuditedEntity]: 'UPDATE' extends AuditedAction<TEntity> ? TEntity : never;
}[AuditedEntity];

@Injectable()
export class AuditLogger {
  constructor(@InjectModel('AuditLog') private readonly auditLogModel: Model<'AuditLog'>) {}

  async log<TEntity extends AuditedEntity>(
    action: AuditedAction<TEntity>,
    entity: TEntity,
    params: AuditLogParams
  ): Promise<void> {
    await this.auditLogModel.create({
      data: {
        action,
        entity,
        group: params.groupId ? { connect: { id: params.groupId } } : undefined,
        metadata: params.metadata,
        timestamp: Date.now(),
        user: {
          connect: {
            id: params.userId
          }
        }
      }
    });
  }

  /**
   * Record an update by the names of the fields it changed, never their values: every admin reads
   * the log, and a record's values are clinical data. An update that changed nothing is not recorded.
   */
  async logUpdate(entity: UpdateAuditedEntity, fields: string[], params: AuditLogParams): Promise<void> {
    if (fields.length === 0) {
      return;
    }
    await this.log('UPDATE', entity, {
      ...params,
      metadata: { ...params.metadata, fields: fields.toSorted().join(',') }
    });
  }
}
