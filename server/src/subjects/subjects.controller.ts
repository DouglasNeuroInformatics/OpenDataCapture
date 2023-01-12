import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { CreateSubjectDto } from './dto/create-subject.dto';
import { Subject } from './schemas/subject.schema';
import { SubjectsService } from './subjects.service';

@ApiTags('Subjects')
@Controller('subjects')
export class SubjectsController {
  constructor(private readonly subjectsService: SubjectsService) {}

  @ApiOperation({
    description: 'Register a new subject in the database',
    summary: 'Create'
  })
  @Post()
  create(@Body() dto: CreateSubjectDto): Promise<Subject> {
    return this.subjectsService.create(dto);
  }

  @ApiOperation({
    description: 'Get all subjects',
    summary: 'Get All'
  })
  @Get()
  findAll(): Promise<Subject[]> {
    return this.subjectsService.findAll();
  }
}
