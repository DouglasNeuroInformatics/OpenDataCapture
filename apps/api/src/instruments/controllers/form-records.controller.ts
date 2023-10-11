import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type {
  AppAbility,
  FormInstrumentRecordsSummary,
  InstrumentRecordsExport,
  Language,
  SubjectFormRecords
} from '@open-data-capture/types';

import { CurrentUser } from '@/core/decorators/current-user.decorator';
import { RouteAccess } from '@/core/decorators/route-access.decorator';

import { CreateFormRecordDto } from '../dto/create-form-record.dto';
import { FormRecordsService } from '../services/form-records.service';

@ApiTags('Instrument Records')
@Controller('instruments/records/forms')
export class FormRecordsController {
  constructor(private readonly formRecordsService: FormRecordsService) {}

  @ApiOperation({ description: 'Create a New Form Record', summary: 'Create Form Record' })
  @Post()
  @RouteAccess({ action: 'create', subject: 'InstrumentRecord' })
  create(
    @Body() createFormRecordDto: CreateFormRecordDto,
    @CurrentUser('ability') ability: AppAbility
  ): Promise<unknown> {
    return this.formRecordsService.create(createFormRecordDto, ability);
  }

  @ApiOperation({ description: 'Export Records', summary: 'Export Records' })
  @Get('export')
  @RouteAccess({ action: 'read', subject: 'InstrumentRecord' })
  exportRecords(
    @CurrentUser('ability') ability: AppAbility,
    @Query('group') groupName?: string
  ): Promise<InstrumentRecordsExport> {
    return this.formRecordsService.exportRecords(ability, groupName);
  }

  @ApiOperation({ description: 'Get Specified Records', summary: 'Find Records' })
  @Get()
  @RouteAccess({ action: 'read', subject: 'InstrumentRecord' })
  find(
    @CurrentUser('ability') ability: AppAbility,
    @Query('subject') subjectIdentifier: string,
    @Query('lang') language?: Language
  ): Promise<SubjectFormRecords[]> {
    return this.formRecordsService.find(ability, subjectIdentifier, language);
  }

  @ApiOperation({ description: 'Compute a Linear Model', summary: 'Linear Model' })
  @Get('linear-regression')
  @RouteAccess({ action: 'read', subject: 'InstrumentRecord' })
  linearRegression(
    @CurrentUser('ability') ability: AppAbility,
    @Query('group') groupName?: string,
    @Query('instrument') instrumentIdentifier?: string
  ): Promise<Record<string, { intercept: number; slope: number; stdErr: number }>> {
    return this.formRecordsService.linearRegression(ability, groupName, instrumentIdentifier);
  }

  @ApiOperation({ description: 'Summarize all available form records', summary: 'Summarize Records' })
  @Get('summary')
  @RouteAccess({ action: 'read', subject: 'InstrumentRecord' })
  summary(
    @CurrentUser('ability') ability: AppAbility,
    @Query('group') groupName?: string,
    @Query('instrument') instrumentIdentifier?: string
  ): Promise<FormInstrumentRecordsSummary> {
    return this.formRecordsService.summary(ability, groupName, instrumentIdentifier);
  }
}
