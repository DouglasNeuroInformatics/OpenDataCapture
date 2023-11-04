import { CurrentUser } from '@douglasneuroinformatics/nestjs/core';
import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { AppAbility } from '@open-data-capture/common/core';

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
  create(@Body() data: CreateInstrumentRecordDto, @CurrentUser('ability') ability: AppAbility) {
    return this.instrumentRecordsService.create(data, { ability });
  }

  // @ApiOperation({ description: 'Export Records', summary: 'Export Records' })
  // @Get('export')
  // @RouteAccess({ action: 'read', subject: 'InstrumentRecord' })
  // exportRecords(
  //   @CurrentUser('ability') ability: AppAbility,
  //   @Query('group') groupName?: string
  // ): Promise<InstrumentRecordsExport> {
  //   return this.formRecordsService.exportRecords(ability, groupName);
  // }

  // @ApiOperation({ description: 'Get Specified Records', summary: 'Find Records' })
  // @Get()
  // @RouteAccess({ action: 'read', subject: 'InstrumentRecord' })
  // find(
  //   @CurrentUser('ability') ability: AppAbility,
  //   @Query('subject') subjectIdentifier: string,
  //   @Query('lang') language?: Language
  // ): Promise<SubjectFormRecords[]> {
  //   return this.formRecordsService.find(ability, subjectIdentifier, language);
  // }

  // @ApiOperation({ description: 'Compute a Linear Model', summary: 'Linear Model' })
  // @Get('linear-regression')
  // @RouteAccess({ action: 'read', subject: 'InstrumentRecord' })
  // linearRegression(
  //   @CurrentUser('ability') ability: AppAbility,
  //   @Query('group') groupName?: string,
  //   @Query('instrument') instrumentIdentifier?: string
  // ): Promise<Record<string, { intercept: number; slope: number; stdErr: number }>> {
  //   return this.formRecordsService.linearRegression(ability, groupName, instrumentIdentifier);
  // }

  // @ApiOperation({ description: 'Summarize all available form records', summary: 'Summarize Records' })
  // @Get('summary')
  // @RouteAccess({ action: 'read', subject: 'InstrumentRecord' })
  // summary(
  //   @CurrentUser('ability') ability: AppAbility,
  //   @Query('group') groupName?: string,
  //   @Query('instrument') instrumentIdentifier?: string
  // ): Promise<FormInstrumentRecordsSummary> {
  //   return this.formRecordsService.summary(ability, groupName, instrumentIdentifier);
  // }
}
