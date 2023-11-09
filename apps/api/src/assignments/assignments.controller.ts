/* eslint-disable perfectionist/sort-classes */

import { CurrentUser, EntityController } from '@douglasneuroinformatics/nestjs/core';
import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import type { Assignment } from '@open-data-capture/common/assignment';
import type { AppAbility } from '@open-data-capture/common/core';

import { RouteAccess } from '@/core/decorators/route-access.decorator';

import { AssignmentsService } from './assignments.service';
import { CreateAssignmentDto } from './dto/create-assignment.dto';

@Controller('assignments')
export class AssignmentsController implements Pick<EntityController<Assignment>, 'create'> {
  constructor(private readonly assignmentsService: AssignmentsService) {}

  @ApiOperation({ summary: 'Create Assignment' })
  @Post()
  @RouteAccess({ action: 'create', subject: 'Assignment' })
  create(@Body() createAssignmentDto: CreateAssignmentDto) {
    return this.assignmentsService.create(createAssignmentDto);
  }

  // @ApiOperation({ summary: 'Delete Assignment' })
  // @Delete(':id')
  // @RouteAccess({ action: 'delete', subject: 'Assignment' })
  // deleteById(@Param('id', ParseIdPipe) id: string, @CurrentUser('ability') ability?: AppAbility) {
  //   return this.assignmentsService.deleteById(id, { ability });
  // }

  @ApiOperation({ summary: 'Get All Assignments' })
  @Get()
  @RouteAccess({ action: 'read', subject: 'Assignment' })
  find(@CurrentUser('ability') ability?: AppAbility, @Query('subjectIdentifier') subjectIdentifier?: string) {
    return this.assignmentsService.find({ subjectIdentifier }, { ability });
  }

  @ApiOperation({ summary: 'Get Summary of Assignments' })
  @Get('summary')
  @RouteAccess({ action: 'read', subject: 'Assignment' })
  findSummaries(@CurrentUser('ability') ability?: AppAbility, @Query('subjectIdentifier') subjectIdentifier?: string) {
    return this.assignmentsService.find({ subjectIdentifier }, { ability });
  }

  // @ApiOperation({ summary: 'Get Assignment' })
  // @Get(':id')
  // @RouteAccess({ action: 'read', subject: 'Assignment' })
  // findById(@Param('id', ParseIdPipe) id: string, @CurrentUser('ability') ability?: AppAbility) {
  //   return this.assignmentsService.findById(id, { ability });
  // }

  // @ApiOperation({ summary: 'Cancel' })
  // @Patch(':id')
  // @RouteAccess({ action: 'update', subject: 'Assignment' })
  // updateById(
  //   @Param('id', ParseIdPipe) id: string,
  //   @Body() updateAssignmentDto: UpdateAssignmentDto,
  //   @CurrentUser('ability') ability?: AppAbility
  // ) {
  //   return this.assignmentsService.updateById(id, updateAssignmentDto, { ability });
  // }
}
