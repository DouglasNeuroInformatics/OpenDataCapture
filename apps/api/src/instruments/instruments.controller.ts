import { CurrentUser, RouteAccess } from '@douglasneuroinformatics/libnest';
import type { AppAbility } from '@douglasneuroinformatics/libnest';
import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { InstrumentKind } from '@opendatacapture/runtime-core';
import type { InstrumentBundleContainer, InstrumentInfo } from '@opendatacapture/schemas/instrument';

import { CreateInstrumentDto } from './dto/create-instrument.dto';
import { InstrumentsService } from './instruments.service';

@ApiTags('Instruments')
@Controller({ path: 'instruments' })
export class InstrumentsController {
  constructor(private readonly instrumentsService: InstrumentsService) {}

  @ApiOperation({ summary: 'Create Instrument' })
  @Post()
  @RouteAccess({ action: 'create', subject: 'Instrument' })
  create(@Body() data: CreateInstrumentDto): Promise<unknown> {
    return this.instrumentsService.create(data);
  }

  @ApiOperation({ summary: 'Get Instrument Bundle' })
  @Get('bundle/:id')
  @RouteAccess({ action: 'read', subject: 'Instrument' })
  async findBundleById(
    @Param('id') id: string,
    @CurrentUser('ability') ability: AppAbility
  ): Promise<InstrumentBundleContainer> {
    return this.instrumentsService.findBundleById(id, { ability });
  }

  @ApiOperation({ summary: 'Summarize Instruments' })
  @Get('info')
  @RouteAccess({ action: 'read', subject: 'Instrument' })
  async findInfo(
    @CurrentUser('ability') ability: AppAbility,
    @Query('kind') kind?: InstrumentKind,
    @Query('subjectId') subjectId?: string
  ): Promise<InstrumentInfo[]> {
    return this.instrumentsService.findInfo({ kind, subjectId }, { ability });
  }
}
