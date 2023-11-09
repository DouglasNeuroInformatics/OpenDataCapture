import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import type { AssignmentBundle } from '@open-data-capture/common/assignment';

import { Render } from '@/decorators/render.decorator';

import IndexPage from '../pages';
import { AssignmentsService } from './assignments.service';
import { CreateAssignmentBundleDto } from './dto/create-assignment-bundle.dto';

@Controller('assignments')
export class AssignmentsController {
  constructor(private readonly assignmentsService: AssignmentsService) {}

  @Post()
  async create(@Body() assignment: CreateAssignmentBundleDto): Promise<AssignmentBundle> {
    return this.assignmentsService.create(assignment);
  }

  @Get()
  async find(@Query('subjectIdentifier') subjectIdentifier?: string) {
    return this.assignmentsService.find({ subjectIdentifier });
  }

  @Get('page')
  @Render(IndexPage)
  render() {
    return { title: 'My Page' };
  }
}
