import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { CreateFormDto } from '../dto/create-form.dto';

import { RouteAccess } from '@/core/decorators/route-access.decorator';

@ApiTags('Instruments')
@Controller('instruments')
export class InstrumentsController {
  @ApiOperation({ description: 'Create a new form instrument' })
  @Post('forms')
  @RouteAccess({ action: 'create', subject: 'Instrument' })
  create(@Body() createFormDto: CreateFormDto): Promise<any> {
    return Promise.resolve(createFormDto);
  }

  @ApiOperation({ description: 'Returns all forms in the database' })
  @Get('forms')
  @RouteAccess({ action: 'read', subject: 'Instrument' })
  findAll(): Promise<any> {
    return Promise.resolve();
  }

  @ApiOperation({ description: 'Returns the provided form' })
  @Get('forms/:id')
  @RouteAccess({ action: 'read', subject: 'Instrument' })
  findOne(@Param('id') id: string): Promise<any> {
    return Promise.resolve(id);
  }

  @ApiOperation({ description: 'Returns the deleted instrument ' })
  @Delete('forms/:id')
  @RouteAccess({ action: 'delete', subject: 'Instrument' })
  remove(@Param('id') id: string): Promise<any> {
    return Promise.resolve(id);
  }
}
