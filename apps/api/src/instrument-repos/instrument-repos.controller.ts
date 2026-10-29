import { ApiOperation, CurrentUser } from '@douglasneuroinformatics/libnest';
import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { $CreateInstrumentRepoData } from '@opendatacapture/schemas/instrument-repo';

import type { AppAbility } from '@/auth/auth.types';
import { ADMIN_ONLY, RouteAccess } from '@/core/decorators/route-access.decorator';

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

  @ApiOperation({ summary: 'Clear the Activity Log of Every Instrument Repo' })
  @Delete('sync/logs')
  @RouteAccess(ADMIN_ONLY)
  deleteSyncLogs(@CurrentUser('ability') ability?: AppAbility) {
    return this.instrumentReposService.deleteSyncLogs({ ability });
  }

  @ApiOperation({ summary: 'Get All Instrument Repos' })
  @Get()
  @RouteAccess({ action: 'read', subject: 'InstrumentRepo' })
  findAll(@CurrentUser('ability') ability?: AppAbility) {
    return this.instrumentReposService.findAll({ ability });
  }

  /**
   * Admin-only where the two sync routes are not, because this is the one that crosses repositories.
   * `InstrumentRepoSyncLog` carries no group, and is absent from `$AppSubjectName` so that no user can
   * be granted it, which leaves nothing to confine a read of the whole history to the repositories the
   * caller may see. The sync routes return only the log of a repository the caller may already update.
   */
  @ApiOperation({ summary: 'Get the Activity Log of Every Instrument Repo' })
  @Get('sync/logs')
  @RouteAccess(ADMIN_ONLY)
  findSyncLogs(@CurrentUser('ability') ability?: AppAbility) {
    return this.instrumentReposService.findSyncLogs({ ability });
  }

  @ApiOperation({ summary: 'Sync Instrument Repo' })
  @Post(':id/sync')
  @RouteAccess({ action: 'update', subject: 'InstrumentRepo' })
  sync(@Param('id') id: string, @CurrentUser('ability') ability?: AppAbility) {
    return this.instrumentReposService.sync(id, { ability });
  }

  @ApiOperation({ summary: 'Sync Every Instrument Repo' })
  @Post('sync/all')
  @RouteAccess({ action: 'update', subject: 'InstrumentRepo' })
  syncAll(@CurrentUser('ability') ability?: AppAbility) {
    return this.instrumentReposService.syncAll({ ability });
  }
}
