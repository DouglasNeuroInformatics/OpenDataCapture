import { Body, Controller, Get, Post } from '@nestjs/common';

import { Render } from '@/decorators/render.decorator';

import IndexPage from '../pages';
import { AssignmentsService } from './assignments.service';
import { CreateAssignmentBundleDto } from './dto/create-assignment-bundle.dto';

@Controller()
export class AssignmentsController {
  constructor(private readonly assignmentsService: AssignmentsService) {}

  @Post()
  create(@Body() assignment: CreateAssignmentBundleDto) {
    this.assignmentsService.create(assignment);
  }

  @Get()
  find() {
    return this.assignmentsService.find();
  }

  @Get('page')
  @Render(IndexPage)
  render() {
    return { title: 'My Page' };
  }
}
