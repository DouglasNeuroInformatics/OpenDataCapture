import { $BooleanLike } from '@douglasneuroinformatics/libjs';
import { ApiOperation, CurrentUser, ParseSchemaPipe, ValidObjectIdPipe } from '@douglasneuroinformatics/libnest';
import type { RequestUser } from '@douglasneuroinformatics/libnest';
import { Controller, Delete, Get, Param, Query } from '@nestjs/common';
import z from 'zod/v4';

import { AuditLogger } from '@/audit/audit.logger';
import type { AppAbility } from '@/auth/auth.types';
import { RouteAccess } from '@/core/decorators/route-access.decorator';

import { SubjectsService } from './subjects.service';

@Controller('subjects')
export class SubjectsController {
  constructor(
    private readonly subjectsService: SubjectsService,
    private readonly auditLogger: AuditLogger
  ) {}

  @ApiOperation({ summary: 'Delete Subject' })
  @Delete(':id')
  @RouteAccess({ action: 'delete', subject: 'Subject' })
  async deleteById(
    @Param('id', new ParseSchemaPipe({ schema: z.string().transform((value) => decodeURIComponent(value)) }))
    id: string,
    @Query('force', new ParseSchemaPipe({ isOptional: true, schema: $BooleanLike })) force: boolean | undefined,
    @CurrentUser() currentUser: RequestUser
  ) {
    const { ability } = currentUser;
    // Counted before the delete removes them. Only a forced delete removes any, and only it may
    // read them: a caller allowed to delete a subject need not hold any rule on its records.
    const recordCount = force ? await this.subjectsService.countDeletableRecords(id, { ability }) : 0;
    const result = await this.subjectsService.deleteById(id, { ability, force });
    // A subject can belong to several groups and the route names none, so the entry names no group.
    await this.auditLogger.log('DELETE', 'SUBJECT', {
      groupId: null,
      metadata: { force: String(force === true), recordCount: String(recordCount), subjectId: id },
      userId: currentUser.id
    });
    return result;
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
