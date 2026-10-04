import { ApiOperation, CurrentUser } from '@douglasneuroinformatics/libnest';
import type { RequestUser } from '@douglasneuroinformatics/libnest';
import { Body, Controller, Delete, Get, Param, ParseBoolPipe, Patch, Post, Query } from '@nestjs/common';
import type { InstrumentKind } from '@opendatacapture/runtime-core';
// Imported as a value (not a type-only import) so it doubles as the validation schema for the request
// body while also annotating its type — no dedicated DTO class is needed.
import {
  $CreateInstrumentData,
  $CreateSeriesInstrumentData,
  $UpdateSeriesInstrumentData
} from '@opendatacapture/schemas/instrument';
import type {
  CreateSeriesInstrumentResult,
  InstrumentBundleContainer,
  InstrumentInfo,
  SeriesInstrumentOverview
} from '@opendatacapture/schemas/instrument';

import type { AppAbility } from '@/auth/auth.types';
import { AcceptsInstrumentToken } from '@/core/decorators/accepts-instrument-token.decorator';
import { ADMIN_ONLY, RouteAccess } from '@/core/decorators/route-access.decorator';

import { InstrumentsService } from './instruments.service';

@Controller({ path: 'instruments' })
export class InstrumentsController {
  constructor(private readonly instrumentsService: InstrumentsService) {}

  @AcceptsInstrumentToken()
  @ApiOperation({ summary: 'Create Instrument' })
  @Post()
  @RouteAccess({ action: 'manage', subject: 'Instrument' })
  create(@Body() data: $CreateInstrumentData): Promise<unknown> {
    return this.instrumentsService.create(data);
  }

  @ApiOperation({ summary: 'Create Series Instrument' })
  @Post('series')
  @RouteAccess({ action: 'create', subject: 'Instrument' })
  createSeries(
    @Body() data: $CreateSeriesInstrumentData,
    @CurrentUser() currentUser: RequestUser
  ): Promise<CreateSeriesInstrumentResult> {
    return this.instrumentsService.createSeries(data, currentUser);
  }

  @ApiOperation({ summary: 'Delete Series Instrument' })
  @Delete(':id')
  @RouteAccess({ action: 'delete', subject: 'Instrument' })
  delete(@Param('id') id: string, @CurrentUser() currentUser: RequestUser): Promise<unknown> {
    return this.instrumentsService.deleteById(id, currentUser);
  }

  @ApiOperation({ summary: 'Get Instrument Bundle' })
  @Get('bundle/:id')
  @RouteAccess({ action: 'read', subject: 'Instrument' })
  async findBundleById(
    @Param('id') id: string,
    @CurrentUser() currentUser: RequestUser,
    @Query('groupId') groupId?: string
  ): Promise<InstrumentBundleContainer> {
    return this.instrumentsService.findBundleById(id, currentUser, groupId);
  }

  @ApiOperation({ summary: 'Summarize Instruments' })
  @Get('info')
  @RouteAccess({ action: 'read', subject: 'Instrument' })
  async findInfo(
    @CurrentUser() currentUser: RequestUser,
    @Query('allEditions', new ParseBoolPipe({ optional: true })) allEditions?: boolean,
    @Query('groupId') groupId?: string,
    @Query('kind') kind?: InstrumentKind,
    @Query('subjectId') subjectId?: string
  ): Promise<InstrumentInfo[]> {
    return this.instrumentsService.findInfo({ allEditions, kind, subjectId }, currentUser, groupId);
  }

  @ApiOperation({ summary: 'List Every Series Instrument' })
  @Get('series')
  @RouteAccess(ADMIN_ONLY)
  findSeriesOverview(@CurrentUser('ability') ability: AppAbility): Promise<SeriesInstrumentOverview[]> {
    return this.instrumentsService.findSeriesOverview({ ability });
  }

  @ApiOperation({ summary: 'List Instruments' })
  @Get('list')
  @RouteAccess({ action: 'read', subject: 'Instrument' })
  async list(
    @CurrentUser() currentUser: RequestUser,
    @Query('groupId') groupId?: string,
    @Query('kind') kind?: InstrumentKind
  ) {
    return this.instrumentsService.list({ kind }, currentUser, groupId);
  }

  @ApiOperation({ summary: 'Archive or Unarchive a Series Instrument' })
  @Patch('series/:id')
  @RouteAccess(ADMIN_ONLY)
  updateSeriesArchive(
    @Param('id') id: string,
    @Body() data: $UpdateSeriesInstrumentData,
    @CurrentUser() currentUser: RequestUser
  ): Promise<{ archivedAt: Date | null; id: string }> {
    return this.instrumentsService.updateSeriesArchive(id, data, currentUser);
  }
}
