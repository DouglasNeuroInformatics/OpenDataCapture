import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
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

  @Get(':id')
  @Render(IndexPage)
  async render(@Param('id') id: string) {
    const assignment = await this.assignmentsService.findById(id);
    return { bundle: assignment!.instrumentBundle };
  }
}
