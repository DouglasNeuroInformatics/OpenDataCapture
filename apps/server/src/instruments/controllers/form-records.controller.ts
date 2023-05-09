import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { type AppAbility } from '@douglasneuroinformatics/common/auth';
import { type Language } from '@douglasneuroinformatics/common/core';
import {
  FormInstrumentRecordsSummary,
  InstrumentRecordsExport,
  SubjectFormRecords
} from '@douglasneuroinformatics/common/instruments';

import { CreateFormRecordDto } from '../dto/create-form-record.dto';
import { FormRecordsService } from '../services/form-records.service';

import { RouteAccess } from '@/core/decorators/route-access.decorator';
import { UserAbility } from '@/core/decorators/user-ability.decorator';

@ApiTags('Instrument Records')
@Controller('instruments/records/forms')
export class FormRecordsController {
  constructor(private readonly formRecordsService: FormRecordsService) {}

  @ApiOperation({ description: 'Create a New Form Record' })
  @Post()
  @RouteAccess({ action: 'create', subject: 'InstrumentRecord' })
  create(@Body() createFormRecordDto: CreateFormRecordDto, @UserAbility() ability: AppAbility): Promise<any> {
    return this.formRecordsService.create(createFormRecordDto, ability);
  }

  @ApiOperation({ description: 'Get Specified Records' })
  @Get()
  @RouteAccess({ action: 'read', subject: 'InstrumentRecord' })
  find(
    @UserAbility() ability: AppAbility,
    @Query('subject') subjectIdentifier: string,
    @Query('lang') language?: Language
  ): Promise<SubjectFormRecords[]> {
    return this.formRecordsService.find(ability, subjectIdentifier, language);
  }

  @ApiOperation({ description: 'Summarize Available Form Records' })
  @Get('summary')
  @RouteAccess({ action: 'read', subject: 'InstrumentRecord' })
  summary(
    @UserAbility() ability: AppAbility,
    @Query('group') groupName?: string,
    @Query('instrument') instrumentIdentifier?: string
  ): Promise<FormInstrumentRecordsSummary> {
    return this.formRecordsService.summary(ability, groupName, instrumentIdentifier);
  }

  @ApiOperation({ description: 'Export Records' })
  @Get('export')
  @RouteAccess({ action: 'read', subject: 'InstrumentRecord' })
  export(@UserAbility() ability: AppAbility, @Query('group') groupName?: string): Promise<InstrumentRecordsExport> {
    return this.formRecordsService.export(ability, groupName);
  }
}
