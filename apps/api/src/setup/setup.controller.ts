import { ApiOperation } from '@douglasneuroinformatics/libnest';
import { Body, Controller, Delete, Get, Patch, Post } from '@nestjs/common';
import { $InitAppOptions, $UpdateSetupStateData } from '@opendatacapture/schemas/setup';
import type { SetupState } from '@opendatacapture/schemas/setup';

import { ADMIN_ONLY, RouteAccess } from '@/core/decorators/route-access.decorator';

import { SetupService } from './setup.service';

@Controller({ path: 'setup' })
export class SetupController {
  constructor(private readonly setupService: SetupService) {}

  @Delete()
  @RouteAccess({ action: 'delete', subject: 'all' })
  async delete(): Promise<void> {
    return this.setupService.delete();
  }

  @ApiOperation({
    description: 'Return the current setup state',
    summary: 'Get State'
  })
  @Get()
  @RouteAccess('public')
  getState(): Promise<SetupState> {
    return this.setupService.getState();
  }

  @ApiOperation({
    description: [
      'Initialize an instance of the application with a default admin user.',
      'Although this route is public, this operation may only be performed when there are no users in the database.'
    ].join(' '),
    summary: 'Initialize'
  })
  @Post()
  @RouteAccess('public')
  initApp(@Body() data: $InitAppOptions): Promise<{ success: boolean }> {
    return this.setupService.initApp(data);
  }

  @ApiOperation({
    description: 'Update the setup state',
    summary: 'Update State'
  })
  @Patch()
  @RouteAccess(ADMIN_ONLY)
  updateState(@Body() data: $UpdateSetupStateData): Promise<Partial<SetupState>> {
    return this.setupService.updateState(data);
  }
}
