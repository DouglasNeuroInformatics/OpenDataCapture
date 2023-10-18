import { EntityController, ParseIdPipe } from '@douglasneuroinformatics/nestjs/core';
import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import type { Assignment } from '@open-data-capture/types';

import { RouteAccess } from '@/core/decorators/route-access.decorator';

import { AssignmentsService } from './assignments.service';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';

@Controller('assignments')
export class AssignmentsController implements EntityController<Assignment> {
  constructor(private readonly assignmentsService: AssignmentsService) {}

  @ApiOperation({ summary: 'Create Assignment' })
  @Post()
  @RouteAccess({ action: 'create', subject: 'Assignment' })
  create(@Body() createAssignmentDto: CreateAssignmentDto) {
    return this.assignmentsService.create(createAssignmentDto);
  }

  @ApiOperation({ summary: 'Delete Assignment' })
  @Delete(':id')
  @RouteAccess({ action: 'delete', subject: 'Assignment' })
  deleteById(@Param('id', ParseIdPipe) id: string) {
    return this.assignmentsService.deleteById(id);
  }

  @ApiOperation({ summary: 'Get All Assignments' })
  @Get()
  @RouteAccess({ action: 'read', subject: 'Assignment' })
  findAll() {
    return this.assignmentsService.findAll();
  }

  @ApiOperation({ summary: 'Get Assignment' })
  @Get(':id')
  @RouteAccess({ action: 'read', subject: 'Assignment' })
  findById(@Param('id', ParseIdPipe) id: string) {
    return this.assignmentsService.findById(id);
  }

  @ApiOperation({ summary: 'Cancel' })
  @Patch(':id')
  @RouteAccess({ action: 'update', subject: 'Assignment' })
  updateById(@Param('id', ParseIdPipe) id: string, @Body() updateAssignmentDto: UpdateAssignmentDto) {
    return this.assignmentsService.updateById(id, updateAssignmentDto);
  }
}
