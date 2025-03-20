/* eslint-disable perfectionist/sort-classes */

import { CurrentUser, ParseSchemaPipe, RouteAccess } from '@douglasneuroinformatics/libnest';
import type { AppAbility } from '@douglasneuroinformatics/libnest';
import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { InstrumentKind } from '@opendatacapture/runtime-core';
import { z } from 'zod';

import { CreateInstrumentRecordDto } from './dto/create-instrument-record.dto';
import { UploadInstrumentRecordsDto } from './dto/upload-instrument-record.dto';
import { InstrumentRecordsService } from './instrument-records.service';

@ApiTags('Instrument Records')
@Controller('instrument-records')
export class InstrumentRecordsController {
  constructor(private readonly instrumentRecordsService: InstrumentRecordsService) {}

  @ApiOperation({ summary: 'Create Instrument Record' })
  @Post()
  @RouteAccess({ action: 'create', subject: 'InstrumentRecord' })
  create(@Body() data: CreateInstrumentRecordDto, @CurrentUser('ability') ability: AppAbility) {
    return this.instrumentRecordsService.create(data, { ability });
  }

  @ApiOperation({ summary: 'Upload Multiple Instrument Records' })
  @Post('upload')
  @RouteAccess({ action: 'create', subject: 'InstrumentRecord' })
  upload(@Body() data: UploadInstrumentRecordsDto, @CurrentUser('ability') ability: AppAbility) {
    return this.instrumentRecordsService.upload(data, { ability });
  }

  @ApiOperation({ summary: 'Get Records for Instrument ' })
  @Get()
  @RouteAccess({ action: 'read', subject: 'InstrumentRecord' })
  find(
    @CurrentUser('ability') ability: AppAbility,
    @Query('kind') kind?: InstrumentKind,
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
    @Query('subjectId') subjectId?: string
  ) {
    return this.instrumentRecordsService.find({ groupId, instrumentId, kind, minDate, subjectId }, { ability });
  }

  @ApiOperation({ summary: 'Export Records' })
  @Get('export')
  @RouteAccess({ action: 'read', subject: 'InstrumentRecord' })
  exportRecords(@CurrentUser('ability') ability: AppAbility, @Query('groupId') groupId?: string) {
    return this.instrumentRecordsService.exportRecords({ groupId }, { ability });
  }

  @ApiOperation({ description: 'Compute a Linear Model', summary: 'Linear Model' })
  @Get('linear-model')
  @RouteAccess({ action: 'read', subject: 'InstrumentRecord' })
  linearModel(
    @CurrentUser('ability') ability: AppAbility,
    @Query('instrumentId') instrumentId: string,
    @Query('groupId') groupId?: string
  ): Promise<{ [key: string]: { intercept: number; slope: number; stdErr: number } }> {
    return this.instrumentRecordsService.linearModel({ groupId, instrumentId }, { ability });
  }
}
