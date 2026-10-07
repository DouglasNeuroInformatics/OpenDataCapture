import { ApiOperation, CurrentUser } from '@douglasneuroinformatics/libnest';
import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { $CreateSessionData } from '@opendatacapture/schemas/session';
import type { SessionWithUser } from '@opendatacapture/schemas/session';
import type { Session } from '@prisma/client';

import type { AppAbility } from '@/auth/auth.types';
import { RouteAccess } from '@/core/decorators/route-access.decorator';

import { SessionsService } from './sessions.service';

@Controller('sessions')
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @ApiOperation({ description: 'Create Session' })
  @Post()
  @RouteAccess({ action: 'create', subject: 'Session' })
  create(@Body() data: $CreateSessionData, @CurrentUser('ability') ability: AppAbility): Promise<Session> {
    return this.sessionsService.create(data, { ability });
  }

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
