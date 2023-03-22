import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { CreateSubjectDto } from './dto/create-subject.dto';
import { Subject } from './schemas/subject.schema';
import { SubjectsService } from './subjects.service';

import { EntityController } from '@/core/abstract/entity.controller';
import { RouteAccess } from '@/core/decorators/route-access.decorator';

@ApiTags('Subjects')
@Controller('subjects')
export class SubjectsController implements EntityController<Subject> {
  constructor(private readonly subjectsService: SubjectsService) {}

  @ApiOperation({ summary: 'Create Subject' })
  @Post()
  @RouteAccess({ action: 'create', subject: 'Subject' })
  create(@Body() createSubjectDto: CreateSubjectDto): Promise<Subject> {
    return this.subjectsService.create(createSubjectDto);
  }

  @ApiOperation({ summary: 'Get All Subjects' })
  @Get()
  @RouteAccess({ action: 'read', subject: 'Subject' })
  findAll(): Promise<Subject[]> {
    return this.subjectsService.findAll();
  }
}
