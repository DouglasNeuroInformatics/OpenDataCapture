import { CurrentUser } from '@douglasneuroinformatics/libnest';
import type { RequestUser } from '@douglasneuroinformatics/libnest';
import { Body, Controller, Delete, ForbiddenException, Get, Param, Post, Query } from '@nestjs/common';
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

import type { AppAbility } from '@/auth/auth.types';
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
    @CurrentUser('ability') ability: AppAbility
  ): Promise<CreateSeriesInstrumentResult> {
    return this.instrumentsService.createSeries(data, { ability });
  }

  @ApiOperation({ summary: 'Delete Series Instrument' })
  @Delete(':id')
  @RouteAccess({ action: 'delete', subject: 'Instrument' })
  delete(@Param('id') id: string, @CurrentUser('ability') ability: AppAbility): Promise<unknown> {
    return this.instrumentsService.deleteById(id, { ability });
  }

  @ApiOperation({ summary: 'Get Instrument Bundle' })
  @Get('bundle/:id')
  @RouteAccess({ action: 'read', subject: 'Instrument' })
  async findBundleById(
    @Param('id') id: string,
    @CurrentUser() currentUser: RequestUser,
    @Query('groupId') groupId?: string
  ): Promise<InstrumentBundleContainer> {
    return this.instrumentsService.findBundleById(id, {
      ability: currentUser.ability,
      groupIds: this.resolveGroupIds(currentUser, groupId)
    });
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
    return this.instrumentsService.findInfo(
      { kind, subjectId },
      { ability: currentUser.ability, groupIds: this.resolveGroupIds(currentUser, groupId) }
    );
  }

  @ApiOperation({ summary: 'List Instruments' })
  @Get('list')
  @RouteAccess({ action: 'read', subject: 'Instrument' })
  async list(
    @CurrentUser() currentUser: RequestUser,
    @Query('groupId') groupId?: string,
    @Query('kind') kind?: InstrumentKind
  ) {
    return this.instrumentsService.list({ kind }, currentUser.ability, this.resolveGroupIds(currentUser, groupId));
  }

  private resolveGroupIds(currentUser: RequestUser, requestedGroupId?: string): string[] {
    if (!requestedGroupId) {
      return currentUser.groups.map(({ id }) => id);
    }
    if (!currentUser.ability.can('manage', 'all') && !currentUser.groups.some(({ id }) => id === requestedGroupId)) {
      throw new ForbiddenException(`Cannot access instruments for group with ID: ${requestedGroupId}`);
    }
    return [requestedGroupId];
  }
}
