import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { SetupDto } from './dto/setup.dto.js';
import { SetupService } from './setup.service.js';

import { RouteAccess } from '@/core/decorators/route-access.decorator.js';

@ApiTags('Setup')
@Controller({ path: 'setup' })
export class SetupController {
  constructor(private readonly setupService: SetupService) {}

  @ApiOperation({
    summary: 'Initialize',
    description: [
      'Initialize an instance of the application with a default admin user',
      'Although this route is public, this operation may only be performed when there are no users in the database.'
    ].join('')
  })
  @Post()
  @RouteAccess('public')
  initApp(@Body() setupDto: SetupDto) {
    return this.setupService.initApp(setupDto);
  }
}
