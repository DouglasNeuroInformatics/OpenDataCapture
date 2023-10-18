import type { EntityController } from '@douglasneuroinformatics/nestjs/core';
import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Subject } from '@open-data-capture/types';

import { RouteAccess } from '@/core/decorators/route-access.decorator';

import { SubjectIdentificationDataDto } from './dto/subject-identification-data.dto';
import { SubjectsService } from './subjects.service';

@ApiTags('Subjects')
@Controller('subjects')
export class SubjectsController implements Omit<EntityController<Partial<Subject>>, 'updateById'> {
  constructor(private readonly subjectsService: SubjectsService) {}

  @ApiOperation({ summary: 'Create Subject' })
  @Post()
  @RouteAccess({ action: 'create', subject: 'Subject' })
  create(@Body() subject: SubjectIdentificationDataDto) {
    return this.subjectsService.create(subject);
  }

  @ApiOperation({ summary: 'Delete Subject' })
  @Delete(':id')
  @RouteAccess({ action: 'delete', subject: 'Subject' })
  deleteById(@Param('id') id: string) {
    return this.subjectsService.deleteById(id);
  }

  @ApiOperation({ summary: 'Get All Subjects' })
  @Get()
  @RouteAccess({ action: 'read', subject: 'Subject' })
  findAll(@Query('group') groupName?: string) {
    return groupName ? this.subjectsService.findByGroup(groupName) : this.subjectsService.findAll();
  }

  @ApiOperation({ summary: 'Get Subject' })
  @Get(':id')
  @RouteAccess({ action: 'read', subject: 'Subject' })
  findById(@Param('id') id: string) {
    return this.subjectsService.findById(id);
  }

  @ApiOperation({ summary: 'Lookup Subject' })
  @Post('lookup')
  @RouteAccess({ action: 'read', subject: 'Subject' })
  @HttpCode(HttpStatus.OK)
  findByLookup(@Body() data: SubjectIdentificationDataDto) {
    return this.subjectsService.findByLookup(data);
  }
}
