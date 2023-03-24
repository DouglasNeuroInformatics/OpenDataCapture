import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { CreateFormDto } from '../dto/create-form.dto';

import { RouteAccess } from '@/core/decorators/route-access.decorator';

@ApiTags('Instruments', 'Forms')
@Controller('instruments/forms')
export class FormsController {
  @ApiOperation({ summary: 'Create a New Form' })
  @RouteAccess({ action: 'create', subject: 'Instrument' })
  @Post()
  create(@Body() createFormDto: CreateFormDto): Promise<any> {
    return Promise.resolve(createFormDto);
  }

  @ApiOperation({ summary: 'Get All Forms' })
  @RouteAccess({ action: 'read', subject: 'Instrument' })
  @Post()
  findAll(): Promise<any> {
    return Promise.resolve();
  }
}
