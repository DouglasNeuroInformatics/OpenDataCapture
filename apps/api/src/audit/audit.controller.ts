import { ParseSchemaPipe } from '@douglasneuroinformatics/libnest';
import { Controller, Get, Query } from '@nestjs/common';
import { $AuditLogsQuerySearchParams } from '@opendatacapture/schemas/audit';
import type { $AuditLog } from '@opendatacapture/schemas/audit';
import { z } from 'zod/v4';

import { RouteAccess } from '@/core/decorators/route-access.decorator';

import { AuditService } from './audit.service';

@Controller('audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get('logs')
  @RouteAccess({ action: 'manage', subject: 'all' })
  find(
    @Query(new ParseSchemaPipe({ schema: $AuditLogsQuerySearchParams }))
    query: z.infer<typeof $AuditLogsQuerySearchParams>
  ): Promise<$AuditLog[]> {
    return this.auditService.find(query);
  }
}
