import { Body, Controller, Get, Post } from '@nestjs/common';

import { RouteAccess } from '@/core/decorators/route-access.decorator';

import { CreateFormInstrumentDto } from './dto/create-form-instrument.dto';
import { InstrumentsService } from './instruments.service';

@Controller({ path: 'instruments', version: '2' })
export class InstrumentsController {
  constructor(private readonly instrumentsService: InstrumentsService) {}

  @Post('forms')
  @RouteAccess({ action: 'create', subject: 'Instrument' })
  create(@Body() createFormInstrumentDto: CreateFormInstrumentDto) {
    return createFormInstrumentDto;
  }

  @Get()
  @RouteAccess({ action: 'read', subject: 'Instrument' })
  findAll() {
    return this.instrumentsService.findAll();
  }
}
