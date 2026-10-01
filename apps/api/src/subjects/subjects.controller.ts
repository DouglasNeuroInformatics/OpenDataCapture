import { $BooleanLike } from '@douglasneuroinformatics/libjs';
import { ApiOperation, CurrentUser, ParseSchemaPipe, ValidObjectIdPipe } from '@douglasneuroinformatics/libnest';
import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { $CreateSubjectData } from '@opendatacapture/schemas/subject';
import z from 'zod/v4';

import type { AppAbility } from '@/auth/auth.types';
import { RouteAccess } from '@/core/decorators/route-access.decorator';

import { SubjectsService } from './subjects.service';

@Controller('subjects')
export class SubjectsController {
  constructor(private readonly subjectsService: SubjectsService) {}

  @ApiOperation({ summary: 'Create Subject' })
  @Post()
  @RouteAccess({ action: 'create', subject: 'Subject' })
  create(@Body() subject: $CreateSubjectData) {
    return this.subjectsService.create(subject);
  }

  @ApiOperation({ summary: 'Delete Subject' })
  @Delete(':id')
  @RouteAccess({ action: 'delete', subject: 'Subject' })
  deleteById(
    @Param('id', new ParseSchemaPipe({ schema: z.string().transform((value) => decodeURIComponent(value)) }))
    id: string,
    @Query('force', new ParseSchemaPipe({ isOptional: true, schema: $BooleanLike })) force: boolean | undefined,
    @CurrentUser('ability') ability: AppAbility
  ) {
    return this.subjectsService.deleteById(id, { ability, force });
  }

  @ApiOperation({ summary: 'Get All Subjects' })
  @Get()
  @RouteAccess({ action: 'read', subject: 'Subject' })
  find(
    @CurrentUser('ability') ability: AppAbility,
    @Query('groupId') groupId?: string,
    @Query('hasRecord', new ParseSchemaPipe({ isOptional: true, schema: $BooleanLike })) hasRecord?: boolean
  ) {
    return this.subjectsService.find({ groupId, hasRecord }, { ability });
  }

  @ApiOperation({ summary: 'Get Subject' })
  @Get(':id')
  @RouteAccess({ action: 'read', subject: 'Subject' })
  findById(@Param('id') id: string, @CurrentUser('ability') ability: AppAbility) {
    return this.subjectsService.findById(id, { ability });
  }

  @ApiOperation({ summary: 'Get the Custom IDs of a Group’s Subjects' })
  @Get('groups/:groupId/custom-ids')
  @RouteAccess({ action: 'read', subject: 'Subject' })
  findCustomIds(@Param('groupId', ValidObjectIdPipe) groupId: string, @CurrentUser('ability') ability: AppAbility) {
    return this.subjectsService.findCustomIds(groupId, { ability });
  }

  @ApiOperation({ summary: 'Get the Custom IDs Scoped to the Default Group' })
  @Get('default-group/custom-ids')
  @RouteAccess({ action: 'read', subject: 'Subject' })
  findDefaultGroupCustomIds(@CurrentUser('ability') ability: AppAbility) {
    return this.subjectsService.findDefaultGroupCustomIds({ ability });
  }
}
