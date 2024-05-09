import { CurrentUser } from '@douglasneuroinformatics/libnest/core';
import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { RouteAccess } from '@/core/decorators/route-access.decorator';
import type { AppAbility } from '@/core/types';

import { ClinicalSubjectIdentificationDataDto } from './dto/subject-identification-data.dto';
import { SubjectsService } from './subjects.service';

@ApiTags('Subjects')
@Controller('subjects')
export class SubjectsController {
  constructor(private readonly subjectsService: SubjectsService) {}

  @ApiOperation({ summary: 'Create Subject' })
  @Post()
  @RouteAccess({ action: 'create', subject: 'Subject' })
  create(@Body() subject: ClinicalSubjectIdentificationDataDto) {
    return this.subjectsService.create(subject);
  }

  @ApiOperation({ summary: 'Delete Subject' })
  @Delete(':id')
  @RouteAccess({ action: 'delete', subject: 'Subject' })
  deleteById(@Param('id') id: string, @CurrentUser('ability') ability: AppAbility) {
    return this.subjectsService.deleteById(id, { ability });
  }

  @ApiOperation({ summary: 'Get All Subjects' })
  @Get()
  @RouteAccess({ action: 'read', subject: 'Subject' })
  find(@CurrentUser('ability') ability: AppAbility, @Query('groupId') groupId?: string) {
    return this.subjectsService.find({ groupId }, { ability });
  }

  @ApiOperation({ summary: 'Get Subject' })
  @Get(':id')
  @RouteAccess({ action: 'read', subject: 'Subject' })
  findById(@Param('id') id: string, @CurrentUser('ability') ability: AppAbility) {
    return this.subjectsService.findById(id, { ability });
  }

  @ApiOperation({ summary: 'Lookup Subject' })
  @Post('lookup')
  @RouteAccess({ action: 'read', subject: 'Subject' })
  @HttpCode(HttpStatus.OK)
  findByLookup(@Body() data: ClinicalSubjectIdentificationDataDto, @CurrentUser('ability') ability: AppAbility) {
    return this.subjectsService.findByLookup(data, { ability });
  }
}
