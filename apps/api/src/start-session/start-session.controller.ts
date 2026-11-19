import { ApiOperation, CurrentUser } from '@douglasneuroinformatics/libnest';
import { Body, Controller, Post } from '@nestjs/common';
import { $StartSessionData } from '@opendatacapture/schemas/session';
import type { Session } from '@prisma/client';

import type { AppAbility } from '@/auth/auth.types';
import { RouteAccess } from '@/core/decorators/route-access.decorator';

import { StartSessionService } from './start-session.service';

@Controller('sessions')
export class StartSessionController {
  constructor(private readonly startSessionService: StartSessionService) {}

  @ApiOperation({
    description:
      "Create a session. When the session's group requires a session instrument, the answers to it are created as a record of the session in the same request, or neither is created.",
    summary: 'Create Session'
  })
  @Post()
  @RouteAccess({ action: 'create', subject: 'Session' })
  create(@Body() data: $StartSessionData, @CurrentUser('ability') ability: AppAbility): Promise<Session> {
    return this.startSessionService.start(data, ability);
  }
}
