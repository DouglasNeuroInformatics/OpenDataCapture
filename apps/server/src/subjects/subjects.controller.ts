import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { type AppAbility } from '@ddcp/common';

import { CreateSubjectDto } from './dto/create-subject.dto';
import { LookupSubjectDto } from './dto/lookup-subject.dto';
import { SubjectEntity } from './entities/subject.entity';
import { SubjectsService } from './subjects.service';

import { RouteAccess } from '@/core/decorators/route-access.decorator';
import { UserAbility } from '@/core/decorators/user-ability.decorator';

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
  findAll(@UserAbility() ability: AppAbility, @Query('group') groupName?: string): Promise<SubjectEntity[]> {
    return this.subjectsService.findAll(ability, groupName);
  }

  @ApiOperation({ summary: 'Lookup Subject' })
  @Post('lookup')
  @RouteAccess({ action: 'read', subject: 'Subject' })
  lookup(@Body() lookupSubjectDto: LookupSubjectDto): Promise<SubjectEntity> {
    return this.subjectsService.lookup(lookupSubjectDto);
  }
}
