import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { FormInstrumentRecord } from '@ddcp/common';

import { InstrumentRecordsService } from '../services/instrument-records.service';

import { RouteAccess } from '@/core/decorators/route-access.decorator';

@ApiTags('Instrument Records')
@Controller('instruments/records')
export class InstrumentRecordsController {
  constructor(private readonly instrumentRecordsService: InstrumentRecordsService) {}

  @ApiOperation({ description: 'Create a new instrument record' })
  @Post()
  @RouteAccess({ action: 'create', subject: 'InstrumentRecord' })
  create(@Body() createRecordDto: any): Promise<any> {
    return Promise.resolve(createRecordDto);
  }

  @ApiOperation({ description: 'Summarize Available Records' })
  @Get()
  @RouteAccess({ action: 'read', subject: 'InstrumentRecord' })
  getInstrumentRecords(
    @Query('instrument') instrumentName?: string,
    @Query('subject') subjectIdentifier?: string
  ): Promise<FormInstrumentRecord[]> {
    return this.instrumentRecordsService.getInstrumentRecords(instrumentName, subjectIdentifier);
  }
}
