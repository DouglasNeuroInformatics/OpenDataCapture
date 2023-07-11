import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import type { FormInstrument, FormInstrumentSummary, Language } from '@ddcp/types';

import { CreateFormDto } from '../dto/create-form.dto.js';
import { FormsService } from '../services/forms.service.js';

import { RouteAccess } from '@/core/decorators/route-access.decorator.js';

@ApiTags('Instruments')
@Controller('instruments/forms')
export class FormsController {
  constructor(private readonly formsService: FormsService) {}

  @ApiOperation({ description: 'Create a new form instrument', summary: 'Create Form' })
  @Post()
  @RouteAccess({ action: 'create', subject: 'Instrument' })
  create(@Body() createFormDto: CreateFormDto): Promise<FormInstrument> {
    return this.formsService.create(createFormDto);
  }

  @ApiOperation({ description: 'Returns all forms in the database', summary: 'Get All Forms' })
  @Get()
  @RouteAccess({ action: 'read', subject: 'Instrument' })
  findAll(): Promise<FormInstrument[]> {
    return this.formsService.findAll();
  }

  @ApiOperation({ description: 'Returns a summary of all available forms', summary: 'Get Summary of All Forms' })
  @Get('available')
  @RouteAccess({ action: 'read', subject: 'Instrument' })
  getAvailable(): Promise<FormInstrumentSummary[]> {
    return this.formsService.getAvailable();
  }

  @ApiOperation({ description: 'Returns the provided form', summary: 'Find Form' })
  @Get(':id')
  @RouteAccess({ action: 'read', subject: 'Instrument' })
  findOne(@Param('id') identifier: string, @Query('lang') language?: Language): Promise<FormInstrument> {
    return this.formsService.findOne(identifier, language);
  }

  @ApiOperation({ description: 'Returns the deleted instrument', summary: 'Delete Form' })
  @Delete(':id')
  @RouteAccess({ action: 'delete', subject: 'Instrument' })
  remove(@Param('id') id: string): Promise<FormInstrument> {
    return this.formsService.remove(id);
  }
}
