import { CurrentUser } from '@douglasneuroinformatics/nestjs/core';
import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { AppAbility } from '@open-data-capture/common/core';

import { RouteAccess } from '@/core/decorators/route-access.decorator';

import { CreateInstrumentDto } from './dto/create-instrument.dto';
import { InstrumentsService } from './instruments.service';

@ApiTags('Instruments')
@Controller({ path: 'instruments' })
export class InstrumentsController {
  constructor(private readonly instrumentsService: InstrumentsService) {}

  @ApiOperation({ summary: 'Create Instrument' })
  @Post()
  @RouteAccess({ action: 'create', subject: 'Instrument' })
  create(@Body() data: CreateInstrumentDto) {
    return this.instrumentsService.create(data);
  }

  @ApiOperation({ summary: 'Find All Instruments' })
  @Get()
  @RouteAccess({ action: 'read', subject: 'Instrument' })
  async findAll(@CurrentUser('ability') ability: AppAbility) {
    return this.instrumentsService.findAll({ ability });
  }
}
