import { ParseIdPipe } from '@douglasneuroinformatics/nestjs/core';
import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Types } from 'mongoose';

import { RouteAccess } from '@/core/decorators/route-access.decorator';

import { CreateFormInstrumentDto } from './dto/create-form-instrument.dto';
import { FormsService } from './forms.service';

@ApiTags('Instruments')
@Controller({ path: 'instruments/forms' })
export class FormsController {
  constructor(private readonly formsService: FormsService) {}

  @ApiOperation({ summary: 'Create Form' })
  @Post()
  @RouteAccess({ action: 'create', subject: 'Instrument' })
  async create(@Body() createFormInstrumentDto: CreateFormInstrumentDto) {
    return this.formsService.create(createFormInstrumentDto);
  }

  @ApiOperation({ summary: 'Get All Forms' })
  @Get()
  @RouteAccess({ action: 'read', subject: 'Instrument' })
  async findAll() {
    return this.formsService.findAll();
  }

  @ApiOperation({ summary: 'Get Form With ID' })
  @Get(':id')
  @RouteAccess({ action: 'read', subject: 'Instrument' })
  async findById(@Query('id', ParseIdPipe) id: Types.ObjectId) {
    return this.formsService.findById(id);
  }
}
