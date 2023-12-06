/* eslint-disable perfectionist/sort-classes */

import { CurrentUser, EntityController } from '@douglasneuroinformatics/nestjs/core';
import { Body, Controller, Get, Param, Patch, Post, Query, Redirect } from '@nestjs/common/decorators';
import { HttpStatus } from '@nestjs/common/enums';
import type { HttpRedirectResponse } from '@nestjs/common/interfaces';
import { ConfigService } from '@nestjs/config';
import { ApiOperation } from '@nestjs/swagger';
import type { Assignment } from '@open-data-capture/common/assignment';

import { RouteAccess } from '@/core/decorators/route-access.decorator';
import type { AppAbility } from '@/core/types';

import { AssignmentsService } from './assignments.service';
import { CreateAssignmentDto } from './dto/create-assignment.dto';

@Controller('assignments')
export class AssignmentsController implements Pick<EntityController<Assignment>, 'create'> {
  private readonly gatewayBaseUrl: string;

  constructor(
    private readonly assignmentsService: AssignmentsService,
    configService: ConfigService
  ) {
    this.gatewayBaseUrl = configService.getOrThrow('GATEWAY_BASE_URL');
  }

  @ApiOperation({ summary: 'Create Assignment' })
  @Post()
  @RouteAccess({ action: 'create', subject: 'Assignment' })
  create(@Body() createAssignmentDto: CreateAssignmentDto) {
    return this.assignmentsService.create(createAssignmentDto);
  }

  // @ApiOperation({ summary: 'Delete Assignment' })
  // @Delete(':id')
  // @RouteAccess({ action: 'delete', subject: 'Assignment' })
  // deleteById(@Param('id', ParseIdPipe) id: string, @CurrentUser('ability') ability?: BaseAppAbility) {
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
  findSummaries(
    @CurrentUser('ability') ability?: AppAbility,
    @Query('subjectIdentifier') subjectIdentifier?: string
  ) {
    return this.assignmentsService.find({ subjectIdentifier }, { ability });
  }

  // @ApiOperation({ summary: 'Get Assignment' })
  // @Get(':id')
  // @RouteAccess({ action: 'read', subject: 'Assignment' })
  // findById(@Param('id', ParseIdPipe) id: string, @CurrentUser('ability') ability?: BaseAppAbility) {
  //   return this.assignmentsService.findById(id, { ability });
  // }

  @ApiOperation({ summary: 'Update Assignment' })
  @Patch(':id')
  @RouteAccess({ action: 'update', subject: 'Assignment' })
  @Redirect()
  updateById(@Param('id') id: string): HttpRedirectResponse {
    return { statusCode: HttpStatus.PERMANENT_REDIRECT, url: `${this.gatewayBaseUrl}/api/assignments/${id}` };
  }
}
