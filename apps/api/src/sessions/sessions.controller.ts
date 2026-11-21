import { ApiOperation, CurrentUser } from '@douglasneuroinformatics/libnest';
import { Controller, Get, Query } from '@nestjs/common';
import type { SessionWithUser } from '@opendatacapture/schemas/session';

import type { AppAbility } from '@/auth/auth.types';
import { RouteAccess } from '@/core/decorators/route-access.decorator';

import { SessionsService } from './sessions.service';

@Controller('sessions')
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @ApiOperation({ description: 'Find all sessions and usernames attached to them' })
  @Get()
  @RouteAccess({ action: 'read', subject: 'Session' })
  findAllIncludeUsernames(
    @CurrentUser('ability') ability: AppAbility,
    @Query('groupId') groupId?: string
  ): Promise<SessionWithUser[]> {
    return this.sessionsService.findAllIncludeUsernames(groupId, { ability });
  }
}
