import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { RouteAccess } from '@/core/decorators/route-access.decorator';

import { SetupDto } from './dto/setup.dto';
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
  getState() {
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
  initApp(@Body() setupDto: SetupDto) {
    return this.setupService.initApp(setupDto);
  }
}
