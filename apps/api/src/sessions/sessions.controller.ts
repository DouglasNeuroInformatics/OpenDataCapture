import { CurrentUser } from '@douglasneuroinformatics/libnest';
import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import type { Session } from '@prisma/client';

import type { AppAbility } from '@/auth/auth.types';
import { RouteAccess } from '@/core/decorators/route-access.decorator';

import { CreateSessionDto } from './dto/create-session.dto';
import { SessionsService } from './sessions.service';

@Controller('sessions')
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @ApiOperation({ description: 'Create Session' })
  @Post()
  @RouteAccess({ action: 'create', subject: 'Session' })
  create(@Body() data: CreateSessionDto): Promise<Session> {
    return this.sessionsService.create(data);
  }

  @ApiOperation({ description: 'Find Session by ID' })
  @Get(':id')
  @RouteAccess({ action: 'read', subject: 'Session' })
  findByID(@Param('id') id: string, @CurrentUser('ability') ability: AppAbility): Promise<Session> {
    return this.sessionsService.findById(id, { ability });
  }

  @ApiOperation({ description: 'Find Sessions by ID' })
  @Post('list')
  @RouteAccess({ action: 'read', subject: 'Session' })
  findSessionList(@Query('ids') ids: string[]): Promise<Session[]> {
    const idArray = Array.isArray(ids) ? ids : (ids as string).split(',');
    return this.sessionsService.findSessionList(idArray);
  }
}
