import { ApiOperation, CurrentUser } from '@douglasneuroinformatics/libnest';
import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { $CreateInstrumentRepoData } from '@opendatacapture/schemas/instrument-repo';

import type { AppAbility } from '@/auth/auth.types';
import { RouteAccess } from '@/core/decorators/route-access.decorator';

import { InstrumentReposService } from './instrument-repos.service';

@Controller('instrument-repos')
export class InstrumentReposController {
  constructor(private readonly instrumentReposService: InstrumentReposService) {}

  @ApiOperation({ summary: 'Create Instrument Repo' })
  @Post()
  @RouteAccess({ action: 'create', subject: 'InstrumentRepo' })
  create(@Body() dto: $CreateInstrumentRepoData) {
    return this.instrumentReposService.create(dto);
  }

  @ApiOperation({ summary: 'Delete Instrument Repo' })
  @Delete(':id')
  @RouteAccess({ action: 'delete', subject: 'InstrumentRepo' })
  deleteById(@Param('id') id: string, @CurrentUser('ability') ability?: AppAbility) {
    return this.instrumentReposService.deleteById(id, { ability });
  }

  @ApiOperation({ summary: 'Get All Instrument Repos' })
  @Get()
  @RouteAccess({ action: 'read', subject: 'InstrumentRepo' })
  findAll(@CurrentUser('ability') ability?: AppAbility) {
    return this.instrumentReposService.findAll({ ability });
  }

  @ApiOperation({ summary: 'Get Instrument Repo' })
  @Get(':id')
  @RouteAccess({ action: 'read', subject: 'InstrumentRepo' })
  findById(@Param('id') id: string, @CurrentUser('ability') ability?: AppAbility) {
    return this.instrumentReposService.findById(id, { ability });
  }

  @ApiOperation({ summary: 'Sync Instrument Repo' })
  @Post(':id/sync')
  @RouteAccess({ action: 'update', subject: 'InstrumentRepo' })
  sync(@Param('id') id: string) {
    return this.instrumentReposService.sync(id);
  }
}
