import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { type AppAbility } from '@open-data-capture/types';

import { CurrentUser } from '@/core/decorators/current-user.decorator';
import { RouteAccess } from '@/core/decorators/route-access.decorator';

import { CreateSubjectDto } from './dto/create-subject.dto';
import { LookupSubjectDto } from './dto/lookup-subject.dto';
import { SubjectEntity } from './entities/subject.entity';
import { SubjectsService } from './subjects.service';

@ApiTags('Subjects')
@Controller('subjects')
export class SubjectsController {
  constructor(private readonly subjectsService: SubjectsService) {}

  @ApiOperation({ summary: 'Create Subject' })
  @Post()
  @RouteAccess({ action: 'create', subject: 'Subject' })
  create(@Body() createSubjectDto: CreateSubjectDto): Promise<SubjectEntity> {
    return this.subjectsService.create(createSubjectDto);
  }

  @ApiOperation({ summary: 'Get All Subjects' })
  @Get()
  @RouteAccess({ action: 'read', subject: 'Subject' })
  findAll(@CurrentUser('ability') ability: AppAbility, @Query('group') groupName?: string): Promise<SubjectEntity[]> {
    return this.subjectsService.findAll(ability, groupName);
  }

  @ApiOperation({ summary: 'Lookup Subject' })
  @Post('lookup')
  @RouteAccess({ action: 'read', subject: 'Subject' })
  lookup(@Body() lookupSubjectDto: LookupSubjectDto): Promise<SubjectEntity> {
    return this.subjectsService.lookup(lookupSubjectDto);
  }
}
