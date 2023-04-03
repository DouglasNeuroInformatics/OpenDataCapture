import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { FormInstrumentRecord, FormInstrumentRecordsSummary } from '@ddcp/common';

import { FormRecordsService } from '../services/form-records.service';

import { RouteAccess } from '@/core/decorators/route-access.decorator';

@ApiTags('Instrument Records')
@Controller('instruments/records/forms')
export class FormRecordsController {
  constructor(private readonly formRecordsService: FormRecordsService) {}

  @ApiOperation({ description: 'Create a New Form Record' })
  @Post()
  @RouteAccess({ action: 'create', subject: 'InstrumentRecord' })
  create(@Body() createRecordDto: any): Promise<any> {
    return Promise.resolve(createRecordDto);
  }

  @ApiOperation({ description: 'Get Specified Records' })
  @Get()
  @RouteAccess({ action: 'read', subject: 'InstrumentRecord' })
  find(
    @Query('instrument') instrumentName?: string,
    @Query('subject') subjectIdentifier?: string
  ): Promise<FormInstrumentRecord[]> {
    return this.formRecordsService.find(instrumentName, subjectIdentifier);
  }

  @ApiOperation({ description: 'Summarize Available Form Records' })
  @Get('summarize')
  @RouteAccess({ action: 'read', subject: 'InstrumentRecord' })
  summarize(): Promise<FormInstrumentRecordsSummary> {
    return this.formRecordsService.summarize();
  }
}
