import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { CreateFormDto } from '../dto/create-form.dto';
import { FormInstrumentsService } from '../services/form-instruments.service';

import { RouteAccess } from '@/core/decorators/route-access.decorator';

@ApiTags('Instruments')
@Controller('instruments/forms')
export class FormInstrumentsController {
  constructor(private readonly formInstrumentsService: FormInstrumentsService) {}

  @ApiOperation({ description: 'Create a new form instrument' })
  @Post()
  @RouteAccess({ action: 'create', subject: 'Instrument' })
  create(@Body() createFormDto: CreateFormDto): Promise<any> {
    return this.formInstrumentsService.create(createFormDto);
  }

  @ApiOperation({ description: 'Returns all forms in the database' })
  @Get()
  @RouteAccess({ action: 'read', subject: 'Instrument' })
  findAll(): Promise<any> {
    return this.formInstrumentsService.findAll();
  }

  @ApiOperation({ description: 'Returns a summary of all available forms' })
  @Get('available')
  @RouteAccess({ action: 'read', subject: 'Instrument' })
  getAvailable(): Promise<any> {
    return this.formInstrumentsService.getAvailable();
  }

  @ApiOperation({ description: 'Returns the provided form' })
  @Get(':id')
  @RouteAccess({ action: 'read', subject: 'Instrument' })
  findOne(@Param('id') id: string): Promise<any> {
    return this.formInstrumentsService.findById(id);
  }

  @ApiOperation({ description: 'Returns the deleted instrument ' })
  @Delete(':id')
  @RouteAccess({ action: 'delete', subject: 'Instrument' })
  remove(@Param('id') id: string): Promise<any> {
    return Promise.resolve(id);
  }
}
