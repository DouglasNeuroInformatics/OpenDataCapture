import { CurrentUser } from '@douglasneuroinformatics/libnest';
import type { RequestUser } from '@douglasneuroinformatics/libnest';
import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { InstrumentKind } from '@opendatacapture/runtime-core';
// Imported as a value (not a type-only import) so it doubles as the validation schema for the request
// body while also annotating its type — no dedicated DTO class is needed.
import { $CreateSeriesInstrumentData } from '@opendatacapture/schemas/instrument';
import type {
  CreateSeriesInstrumentResult,
  InstrumentBundleContainer,
  InstrumentInfo
} from '@opendatacapture/schemas/instrument';

import { RouteAccess } from '@/core/decorators/route-access.decorator';

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
    @Query('groupId') groupId?: string,
    @Query('kind') kind?: InstrumentKind,
    @Query('subjectId') subjectId?: string
  ): Promise<InstrumentInfo[]> {
    return this.instrumentsService.findInfo({ kind, subjectId }, currentUser, groupId);
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
}
