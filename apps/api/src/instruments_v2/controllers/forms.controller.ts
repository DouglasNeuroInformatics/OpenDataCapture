import { Body, Controller, Get, Post } from '@nestjs/common';

import { RouteAccess } from '@/core/decorators/route-access.decorator';

import { CreateFormInstrumentDto } from '../dto/create-form-instrument.dto';
import { FormsService } from '../services/forms.service';

@Controller({ path: 'instruments/forms', version: '2' })
export class FormsController {
  constructor(private readonly formsService: FormsService) {}

  @Post()
  @RouteAccess({ action: 'create', subject: 'Instrument' })
  create(@Body() createFormInstrumentDto: CreateFormInstrumentDto) {
    return this.formsService.create(createFormInstrumentDto);
  }

  @Get()
  @RouteAccess({ action: 'read', subject: 'Instrument' })
  findAll() {
    return this.formsService.findAll();
  }
}
