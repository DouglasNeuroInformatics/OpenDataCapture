import { Body, Controller, Get, Post } from '@nestjs/common';

import { Render } from '@/decorators/render.decorator';

import IndexPage from '../pages';
import { AssignmentsService } from './assignments.service';
import { AddGatewayAssignmentsDto } from './dto/add-gateway-assignments.dto';

@Controller()
export class AssignmentsController {
  constructor(private readonly assignmentsService: AssignmentsService) {}

  @Post()
  addAssignments(@Body() { assignments }: AddGatewayAssignmentsDto) {
    this.assignmentsService.addAssignments(assignments);
  }

  @Get()
  @Render(IndexPage)
  render() {
    return { title: 'My Page' };
  }
}
