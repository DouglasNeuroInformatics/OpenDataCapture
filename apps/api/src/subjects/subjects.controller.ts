import { $BooleanLike } from '@douglasneuroinformatics/libjs';
import { ApiOperation, CurrentUser, ParseSchemaPipe, ValidObjectIdPipe } from '@douglasneuroinformatics/libnest';
import { Body, Controller, Delete, Get, Param, Put, Query } from '@nestjs/common';
import { $UpdateSubjectIdentificationSettingsData } from '@opendatacapture/schemas/subject-identification';
import type { SubjectIdentificationSettings } from '@opendatacapture/schemas/subject-identification';
import z from 'zod/v4';

import type { AppAbility } from '@/auth/auth.types';
import { ADMIN_ONLY, RouteAccess } from '@/core/decorators/route-access.decorator';

import { SubjectIdentificationService } from './subject-identification.service';
import { SubjectsService } from './subjects.service';

@Controller('subjects')
export class SubjectsController {
  constructor(
    private readonly subjectIdentificationService: SubjectIdentificationService,
    private readonly subjectsService: SubjectsService
  ) {}

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

  // Two segments, so `@Get(':id')` cannot capture the path whatever order the handlers are in.
  @ApiOperation({
    description:
      'Every user who can read subjects can read the settings, salt included: the browser derives a custom-fields id itself, so the values typed never reach the server.',
    summary: 'Get Subject Identification Settings'
  })
  @Get('identification/settings')
  @RouteAccess({ action: 'read', subject: 'Subject' })
  getIdentificationSettings(): Promise<SubjectIdentificationSettings> {
    return this.subjectIdentificationService.getSettings();
  }

  @ApiOperation({ summary: 'Update Subject Identification Settings' })
  @Put('identification/settings')
  @RouteAccess(ADMIN_ONLY)
  updateIdentificationSettings(
    @Body() data: $UpdateSubjectIdentificationSettingsData
  ): Promise<SubjectIdentificationSettings> {
    return this.subjectIdentificationService.updateSettings(data);
  }
}
