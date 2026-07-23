import { ParseSchemaPipe } from '@douglasneuroinformatics/libnest';
import { Controller, Get, Query } from '@nestjs/common';
import { $AuditLogsQueryParams } from '@opendatacapture/schemas/audit';
import type { $AuditLogsPage } from '@opendatacapture/schemas/audit';
import { z } from 'zod/v4';

import { RouteAccess } from '@/core/decorators/route-access.decorator';

import { AuditService } from './audit.service';

@Controller('audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get('logs')
  @RouteAccess({ action: 'manage', subject: 'all' })
  find(
    @Query(new ParseSchemaPipe({ schema: $AuditLogsQueryParams }))
    query: z.infer<typeof $AuditLogsQueryParams>
  ): Promise<$AuditLogsPage> {
    return this.auditService.find(query);
  }
}
