import { Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { FormInstrumentEntity } from '../entities/form-instrument.entity';

import { EntityController } from '@/core/abstract/entity.controller';
import { RouteAccess } from '@/core/decorators/route-access.decorator';

@ApiTags('Instruments', 'Forms')
@Controller('instruments/forms')
export class FormsController {
  @ApiOperation({ summary: 'Create a New Form' })
  @RouteAccess({ action: 'create', subject: 'Instrument' })
  @Post()
  create(): Promise<any> {
    return Promise.resolve('foo');
  }

  @ApiOperation({ summary: 'Get All Forms' })
  @RouteAccess({ action: 'read', subject: 'Instrument' })
  @Post()
  findAll(): Promise<any> {
    return Promise.resolve();
  }
}
