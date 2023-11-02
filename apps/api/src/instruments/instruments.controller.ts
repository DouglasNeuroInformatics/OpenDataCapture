import { CurrentUser, ParseIdPipe } from '@douglasneuroinformatics/nestjs/core';
import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { AppAbility } from '@open-data-capture/common/core';

import { RouteAccess } from '@/core/decorators/route-access.decorator';

import { MutateInstrumentDto } from './dto/mutate-instrument.dto';
import { InstrumentsService } from './instruments.service';

@ApiTags('Instruments')
@Controller({ path: 'instruments' })
export class InstrumentsController {
  constructor(private readonly instrumentsService: InstrumentsService) {}

  @ApiOperation({ summary: 'Create Instrument' })
  @Post()
  @RouteAccess({ action: 'create', subject: 'Instrument' })
  create(@Body() data: MutateInstrumentDto) {
    return this.instrumentsService.create(data);
  }

  @ApiOperation({ summary: 'Delete Instrument' })
  @Delete(':id')
  @RouteAccess({ action: 'delete', subject: 'Instrument' })
  async deleteById(@Param('id', ParseIdPipe) id: string, @CurrentUser('ability') ability: AppAbility) {
    return this.instrumentsService.deleteById(id, { ability });
  }

  @ApiOperation({ summary: 'Find All Instruments' })
  @Get()
  @RouteAccess({ action: 'read', subject: 'Instrument' })
  async findAll(@CurrentUser('ability') ability: AppAbility) {
    return this.instrumentsService.findAll({ ability });
  }

  @ApiOperation({ summary: 'Summarize Available Instruments' })
  @Get('available')
  @RouteAccess({ action: 'read', subject: 'Instrument' })
  async findAvailable(@CurrentUser('ability') ability: AppAbility) {
    return this.instrumentsService.findAvailable({ ability });
  }

  @ApiOperation({ summary: 'Get Instrument' })
  @Get(':id')
  @RouteAccess({ action: 'read', subject: 'Instrument' })
  async findById(@Param('id', ParseIdPipe) id: string, @CurrentUser('ability') ability: AppAbility) {
    return this.instrumentsService.findById(id, { ability });
  }

  @ApiOperation({ summary: 'Update Instrument' })
  @Patch(':id')
  @RouteAccess({ action: 'update', subject: 'Instrument' })
  async updateById(
    @Param('id', ParseIdPipe) id: string,
    @Body() update: MutateInstrumentDto,
    @CurrentUser('ability') ability: AppAbility
  ) {
    return this.instrumentsService.updateById(id, update, { ability });
  }
}
