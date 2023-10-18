import { ParseIdPipe } from '@douglasneuroinformatics/nestjs/core';
import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { Types } from 'mongoose';

import { RouteAccess } from '@/core/decorators/route-access.decorator';

import { AssignmentsService } from './assignments.service';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';

@Controller('assignments')
export class AssignmentsController {
  constructor(private readonly assignmentsService: AssignmentsService) {}

  @ApiOperation({ summary: 'Create Assignment' })
  @Post()
  @RouteAccess({ action: 'create', subject: 'Assignment' })
  create(@Body() createAssignmentDto: CreateAssignmentDto) {
    return this.assignmentsService.create(createAssignmentDto);
  }

  @ApiOperation({ summary: 'Get All Assignments' })
  @Get()
  @RouteAccess({ action: 'read', subject: 'Assignment' })
  findAll() {
    return this.assignmentsService.findAll();
  }

  @ApiOperation({ summary: 'Cancel' })
  @Patch(':id')
  @RouteAccess({ action: 'update', subject: 'Assignment' })
  updateById(@Param('id', ParseIdPipe) id: Types.ObjectId, @Body() updateAssignmentDto: UpdateAssignmentDto) {
    return this.assignmentsService.updateById(id, updateAssignmentDto);
  }
}
