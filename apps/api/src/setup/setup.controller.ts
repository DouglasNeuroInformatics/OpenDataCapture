import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { SetupState } from '@open-data-capture/schemas/setup';

import { RouteAccess } from '@/core/decorators/route-access.decorator';

import { InitAppDto } from './dto/init-app.dto';
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
}
