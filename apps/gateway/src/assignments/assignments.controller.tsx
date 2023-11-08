import { Controller, Get, Post } from '@nestjs/common';

import { Render } from '@/decorators/render.decorator';

import IndexPage from '../pages';
import { AssignmentsService } from './assignments.service';

@Controller()
export class AssignmentsController {
  constructor(private readonly assignmentsService: AssignmentsService) {}

  @Post()
  addAssignments() {
    this.assignmentsService.addAssignment();
  }

  @Get()
  @Render(IndexPage)
  render() {
    return { title: 'My Page' };
  }
}
