import { RouteAccess } from '@douglasneuroinformatics/libnest';
import { Body, Controller, Get, Patch, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { SetupState } from '@opendatacapture/schemas/setup';

import { InitAppDto } from './dto/init-app.dto';
import { UpdateSetupStateDto } from './dto/update-setup-state.dto';
import { SetupService } from './setup.service';

@ApiTags('Setup')
@Controller({ path: 'setup' })
export class SetupController {
  constructor(private readonly setupService: SetupService) {}

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
  initApp(@Body() initAppDto: InitAppDto): Promise<{ success: boolean }> {
    return this.setupService.initApp(initAppDto);
  }

  @ApiOperation({
    description: 'Update the setup state',
    summary: 'Update State'
  })
  @Patch()
  @RouteAccess({ action: 'manage', subject: 'all' })
  updateState(@Body() data: UpdateSetupStateDto): Promise<Partial<SetupState>> {
    return this.setupService.updateState(data);
  }
}
