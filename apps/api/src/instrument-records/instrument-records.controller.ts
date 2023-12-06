/* eslint-disable perfectionist/sort-classes */

import { CurrentUser, ParseSchemaPipe } from '@douglasneuroinformatics/nestjs/core';
import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { BaseAppAbility } from '@open-data-capture/common/core';
import { z } from 'zod';

import { RouteAccess } from '@/core/decorators/route-access.decorator';

import { CreateInstrumentRecordDto } from './dto/create-instrument-record.dto';
import { InstrumentRecordsService } from './instrument-records.service';

@ApiTags('Instrument Records')
@Controller('instrument-records')
export class InstrumentRecordsController {
  constructor(private readonly instrumentRecordsService: InstrumentRecordsService) {}

  @ApiOperation({ summary: 'Create Instrument Record' })
  @Post()
  @RouteAccess({ action: 'create', subject: 'InstrumentRecord' })
  create(@Body() data: CreateInstrumentRecordDto, @CurrentUser('ability') ability: BaseAppAbility) {
    return this.instrumentRecordsService.create(data, { ability });
  }

  @ApiOperation({ summary: 'Get Records for Instrument ' })
  @Get()
  @RouteAccess({ action: 'read', subject: 'InstrumentRecord' })
  find(
    @CurrentUser('ability') ability: BaseAppAbility,
    @Query(
      'minDate',
      new ParseSchemaPipe({
        isOptional: true,
        schema: z.coerce.date()
      })
    )
    minDate?: Date,
    @Query('groupId') groupId?: string,
    @Query('instrumentId') instrumentId?: string,
    @Query('subjectIdentifier') subjectIdentifier?: string
  ) {
    return this.instrumentRecordsService.find({ groupId, instrumentId, minDate, subjectIdentifier }, { ability });
  }

  @ApiOperation({ summary: 'Export Records' })
  @Get('export')
  @RouteAccess({ action: 'read', subject: 'InstrumentRecord' })
  exportRecords(@CurrentUser('ability') ability: BaseAppAbility, @Query('groupId') groupId?: string) {
    return this.instrumentRecordsService.exportRecords({ groupId }, { ability });
  }

  @ApiOperation({ description: 'Compute a Linear Model', summary: 'Linear Model' })
  @Get('linear-model')
  @RouteAccess({ action: 'read', subject: 'InstrumentRecord' })
  linearModel(
    @CurrentUser('ability') ability: BaseAppAbility,
    @Query('instrumentId') instrumentId: string,
    @Query('groupId') groupId?: string
  ): Promise<Record<string, { intercept: number; slope: number; stdErr: number }>> {
    return this.instrumentRecordsService.linearModel({ groupId, instrumentId }, { ability });
  }
}
