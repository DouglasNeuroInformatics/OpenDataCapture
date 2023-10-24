/* eslint-disable perfectionist/sort-classes */

import { CurrentUser, type EntityController, ParseIdPipe } from '@douglasneuroinformatics/nestjs/core';
import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { AppAbility, FormInstrument } from '@open-data-capture/types';

import { RouteAccess } from '@/core/decorators/route-access.decorator';

import { CreateFormDto } from './dto/create-form.dto';
import { UpdateFormDto } from './dto/update-form.dto';
import { FormsService } from './forms.service';

@ApiTags('Instruments')
@Controller({ path: 'instruments/forms' })
export class FormsController implements EntityController<FormInstrument> {
  constructor(private readonly formsService: FormsService) {}

  @ApiOperation({ summary: 'Create Form' })
  @Post()
  @RouteAccess({ action: 'create', subject: 'Instrument' })
  async create(@Body() form: CreateFormDto) {
    return this.formsService.create(form);
  }

  @ApiOperation({ summary: 'Delete Form' })
  @Delete(':id')
  @RouteAccess({ action: 'delete', subject: 'Instrument' })
  async deleteById(@Param('id', ParseIdPipe) id: string, @CurrentUser('ability') ability: AppAbility) {
    return this.formsService.deleteById(id, { ability });
  }

  @ApiOperation({ summary: 'Get All Forms' })
  @Get()
  @RouteAccess({ action: 'read', subject: 'Instrument' })
  async findAll(@CurrentUser('ability') ability: AppAbility) {
    return this.formsService.findAll({ ability });
  }

  @ApiOperation({ summary: 'Summarize Available Forms' })
  @Get('available')
  @RouteAccess({ action: 'read', subject: 'Instrument' })
  async getAvailable(@CurrentUser('ability') ability: AppAbility) {
    return this.formsService.getAvailable({ ability });
  }

  @ApiOperation({ summary: 'Get Form' })
  @Get(':id')
  @RouteAccess({ action: 'read', subject: 'Instrument' })
  async findById(@Param('id', ParseIdPipe) id: string, @CurrentUser('ability') ability: AppAbility) {
    return this.formsService.findById(id, { ability });
  }

  @ApiOperation({ summary: 'Update Form' })
  @Patch(':id')
  @RouteAccess({ action: 'update', subject: 'Instrument' })
  async updateById(
    @Param('id', ParseIdPipe) id: string,
    @Body() update: UpdateFormDto,
    @CurrentUser('ability') ability: AppAbility
  ) {
    return this.formsService.updateById(id, update, { ability });
  }
}
