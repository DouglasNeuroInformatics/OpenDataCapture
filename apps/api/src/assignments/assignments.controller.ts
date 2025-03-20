import { CurrentUser, RouteAccess } from '@douglasneuroinformatics/libnest';
import type { AppAbility } from '@douglasneuroinformatics/libnest';
import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common/decorators';
import { ApiOperation } from '@nestjs/swagger';
import type { Assignment } from '@opendatacapture/schemas/assignment';

import { AssignmentsService } from './assignments.service';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';

@Controller('assignments')
export class AssignmentsController {
  constructor(private readonly assignmentsService: AssignmentsService) {}

  @ApiOperation({ summary: 'Create Assignment' })
  @Post()
  @RouteAccess({ action: 'create', subject: 'Assignment' })
  create(@Body() data: CreateAssignmentDto): Promise<Assignment> {
    return this.assignmentsService.create(data);
  }

  @ApiOperation({ summary: 'Get All Assignments' })
  @Get()
  @RouteAccess({ action: 'read', subject: 'Assignment' })
  find(@CurrentUser('ability') ability?: AppAbility, @Query('subjectId') subjectId?: string): Promise<Assignment[]> {
    return this.assignmentsService.find({ subjectId }, { ability });
  }

  @ApiOperation({ summary: 'Update Assignment' })
  @Patch(':id')
  @RouteAccess({ action: 'update', subject: 'Assignment' })
  updateById(@Param('id') id: string, @Body() data: UpdateAssignmentDto, @CurrentUser('ability') ability?: AppAbility) {
    return this.assignmentsService.updateById(id, data, { ability });
  }
}
