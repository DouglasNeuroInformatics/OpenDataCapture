/* eslint-disable perfectionist/sort-classes */

import { CurrentUser } from '@douglasneuroinformatics/nestjs/core';
import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Redirect } from '@nestjs/common/decorators';
import { HttpStatus } from '@nestjs/common/enums';
import type { HttpRedirectResponse } from '@nestjs/common/interfaces';
import { ConfigService } from '@nestjs/config';
import { ApiOperation } from '@nestjs/swagger';

import { RouteAccess } from '@/core/decorators/route-access.decorator';
import type { AppAbility } from '@/core/types';

import { AssignmentsService } from './assignments.service';
import { CreateAssignmentDto } from './dto/create-assignment.dto';

/**
 * In some cases, the `AssignmentsController` delegates to the `AssignmentsService`, like any other
 * controller in the code. In others, it simply redirects the request directly to the gateway.
 */
@Controller('assignments')
export class AssignmentsController {
  private readonly gatewayBaseUrl: string;

  constructor(
    private readonly assignmentsService: AssignmentsService,
    configService: ConfigService
  ) {
    this.gatewayBaseUrl = configService.get('GATEWAY_BASE_URL');
  }

  @ApiOperation({ summary: 'Create Assignment' })
  @Post()
  @RouteAccess({ action: 'create', subject: 'Assignment' })
  create(@Body() createAssignmentDto: CreateAssignmentDto) {
    return this.assignmentsService.create(createAssignmentDto);
  }

  @ApiOperation({ summary: 'Delete Assignment' })
  @Delete(':id')
  @Redirect()
  @RouteAccess({ action: 'delete', subject: 'Assignment' })
  deleteById(@Param('id') id: string): HttpRedirectResponse {
    return { statusCode: HttpStatus.PERMANENT_REDIRECT, url: `${this.gatewayBaseUrl}/api/assignments/${id}` };
  }

  @ApiOperation({ summary: 'Get All Assignments' })
  @Get()
  @RouteAccess({ action: 'read', subject: 'Assignment' })
  find(@CurrentUser('ability') ability?: AppAbility, @Query('subjectId') subjectId?: string) {
    return this.assignmentsService.find({ subjectId }, { ability });
  }

  @ApiOperation({ summary: 'Update Assignment' })
  @Patch(':id')
  @RouteAccess({ action: 'update', subject: 'Assignment' })
  @Redirect()
  updateById(@Param('id') id: string): HttpRedirectResponse {
    return { statusCode: HttpStatus.PERMANENT_REDIRECT, url: `${this.gatewayBaseUrl}/api/assignments/${id}` };
  }
}
