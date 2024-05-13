/* eslint-disable perfectionist/sort-classes */

import { CurrentUser } from '@douglasneuroinformatics/libnest/core';
import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { InstrumentBundleContainer, InstrumentKind, InstrumentSummary } from '@opendatacapture/schemas/instrument';

import { RouteAccess } from '@/core/decorators/route-access.decorator';
import type { AppAbility } from '@/core/types';

import { CreateInstrumentDto } from './dto/create-instrument.dto';
import { CreateInstrumentFromBundleDto } from './dto/create-instrument-from-bundle.dto';
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

  @ApiOperation({ summary: 'Create Instrument From Bundle' })
  @Post('bundle')
  @RouteAccess({ action: 'create', subject: 'Instrument' })
  createFromBundle(@Body() data: CreateInstrumentFromBundleDto): Promise<unknown> {
    return this.instrumentsService.createFromBundle(data.bundle, { kind: data.kind });
  }

  @ApiOperation({ summary: 'Find All Instruments' })
  @Get()
  @RouteAccess({ action: 'read', subject: 'Instrument' })
  async find(@CurrentUser('ability') ability: AppAbility, @Query('kind') kind?: InstrumentKind): Promise<unknown[]> {
    return this.instrumentsService.find({ kind }, { ability });
  }

  @ApiOperation({ summary: 'Find Bundles' })
  @Get('bundles')
  @RouteAccess({ action: 'read', subject: 'Instrument' })
  async findBundles(
    @CurrentUser('ability') ability: AppAbility,
    @Query('kind') kind?: InstrumentKind
  ): Promise<InstrumentBundleContainer[]> {
    return this.instrumentsService.findBundles({ kind }, { ability });
  }

  @ApiOperation({ summary: 'Summarize Instruments' })
  @Get('summaries')
  @RouteAccess({ action: 'read', subject: 'Instrument' })
  async findSummaries(
    @CurrentUser('ability') ability: AppAbility,
    @Query('kind') kind?: InstrumentKind,
    @Query('subjectId') subjectId?: string
  ): Promise<InstrumentSummary[]> {
    return this.instrumentsService.findSummaries({ kind, subjectId }, { ability });
  }

  @ApiOperation({ summary: 'Get Instrument' })
  @Get(':id')
  @RouteAccess({ action: 'read', subject: 'Instrument' })
  async findById(@Param('id') id: string, @CurrentUser('ability') ability: AppAbility) {
    return this.instrumentsService.findById(id, { ability });
  }
}
