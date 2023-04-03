import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { CreateSubjectDto } from './dto/create-subject.dto';
import { SubjectEntity } from './entities/subject.entity';
import { SubjectsService } from './subjects.service';

import { EntityController } from '@/core/abstract/entity.controller';
import { RouteAccess } from '@/core/decorators/route-access.decorator';
import { LookupSubjectDto } from './dto/lookup-subject.dto';

@ApiTags('Subjects')
@Controller('subjects')
export class SubjectsController implements EntityController<SubjectEntity> {
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
  findAll(): Promise<SubjectEntity[]> {
    return this.subjectsService.findAll();
  }

  @ApiOperation({ summary: 'Lookup Subject' })
  @Post('lookup')
  @RouteAccess({ action: 'read', subject: 'Subject' })
  lookup(@Body() lookupSubjectDto: LookupSubjectDto): Promise<SubjectEntity> {
    return this.subjectsService.lookup(lookupSubjectDto);
  }
}
