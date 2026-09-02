import { CurrentUser } from '@douglasneuroinformatics/libnest';
import type { RequestUser } from '@douglasneuroinformatics/libnest';
import { BadRequestException, Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { Assignment, BulkAssignmentPreflightResult } from '@opendatacapture/schemas/assignment';
import { DEFAULT_ASSIGNMENT_EMAIL_TEMPLATE } from '@opendatacapture/schemas/mail';
import type { EmailDeliveryResult, MailTemplate } from '@opendatacapture/schemas/mail';

import { AuditLogger } from '@/audit/audit.logger';
import type { AppAbility } from '@/auth/auth.types';
import { ASSIGNMENT_EMAIL_THROTTLER_LIMIT, ASSIGNMENT_EMAIL_THROTTLER_TTL } from '@/core/constants';
import { RouteAccess } from '@/core/decorators/route-access.decorator';
import { GroupsService } from '@/groups/groups.service';
import { MailService } from '@/mail/mail.service';

import { AssignmentsService } from './assignments.service';
import { BulkAssignmentPreflightDto, CreateBulkAssignmentsDto } from './dto/bulk-assignment.dto';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { SendAssignmentEmailDto } from './dto/send-assignment-email.dto';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';

@Controller('assignments')
export class AssignmentsController {
  constructor(
    private readonly assignmentsService: AssignmentsService,
    private readonly auditLogger: AuditLogger,
    private readonly groupsService: GroupsService,
    private readonly mailService: MailService
  ) {}

  // Both `bulk` routes must stay above `:id/email` and `:id`, or `bulk` is captured as an assignment
  // id. `perfectionist/sort-classes` happens to preserve that today because `bulkPreflight` and
  // `createBulk` sort ahead of `sendEmail` and `updateById` — renaming any of them could silently
  // reverse it, so check the emitted order rather than assuming.
  //
  // `create Assignment` is the action these perform; the group, instrument and subject scoping that
  // `RouteAccess` cannot express is enforced in the service, which also checks `read Subject` through
  // `accessibleQuery` before any subject is used.
  @ApiOperation({ summary: 'Validate a Bulk Assignment Request' })
  @Post('bulk/preflight')
  @RouteAccess({ action: 'create', subject: 'Assignment' })
  bulkPreflight(
    @Body() data: BulkAssignmentPreflightDto,
    @CurrentUser() currentUser: RequestUser
  ): Promise<BulkAssignmentPreflightResult> {
    return this.assignmentsService.bulkPreflight(data, currentUser);
  }

  @ApiOperation({ summary: 'Create Assignment' })
  @Post()
  @RouteAccess({ action: 'create', subject: 'Assignment' })
  create(@Body() data: CreateAssignmentDto, @CurrentUser() currentUser: RequestUser): Promise<Assignment> {
    return this.assignmentsService.create(data, currentUser);
  }

  @ApiOperation({ summary: 'Create Assignments in Bulk' })
  @Post('bulk')
  @RouteAccess({ action: 'create', subject: 'Assignment' })
  createBulk(@Body() data: CreateBulkAssignmentsDto, @CurrentUser() currentUser: RequestUser): Promise<Assignment[]> {
    return this.assignmentsService.createBulk(data, currentUser);
  }

  @ApiOperation({ summary: 'Get All Assignments' })
  @Get()
  @RouteAccess({ action: 'read', subject: 'Assignment' })
  find(@CurrentUser('ability') ability?: AppAbility, @Query('subjectId') subjectId?: string): Promise<Assignment[]> {
    return this.assignmentsService.find({ subjectId }, { ability });
  }

  @ApiOperation({ summary: 'Email Assignment Link' })
  @Post(':id/email')
  @RouteAccess({ action: 'update', subject: 'Assignment' })
  // This route makes the instance's mail identity deliver a live assignment credential to a
  // caller-supplied address, so it is bounded independently of the global default.
  @Throttle({ long: { limit: ASSIGNMENT_EMAIL_THROTTLER_LIMIT, ttl: ASSIGNMENT_EMAIL_THROTTLER_TTL } })
  async sendEmail(
    @Param('id') id: string,
    @Body() { language, recipient, templateId }: SendAssignmentEmailDto,
    @CurrentUser() currentUser: RequestUser
  ): Promise<EmailDeliveryResult> {
    const { ability } = currentUser;
    const assignment = await this.assignmentsService.findById(id, { ability });
    // Choose the requested template if given (null selects the built-in default), else the
    // group's active one, falling back to the default when the active id resolves to nothing.
    let template: MailTemplate = { ...DEFAULT_ASSIGNMENT_EMAIL_TEMPLATE };
    if (assignment.groupId) {
      const group = await this.groupsService.findById(assignment.groupId, { ability });
      const targetId = templateId === undefined ? group.activeAssignmentEmailTemplateId : templateId;
      const chosen = group.emailTemplates?.find(({ id }) => id === targetId);
      // An explicitly requested template that no longer exists must not become a silent
      // substitution of wording the caller never chose — it was deleted under their open form.
      if (templateId && !chosen) {
        throw new BadRequestException(`No email template with id '${templateId}' exists in this group`);
      }
      if (chosen?.body && chosen.subject) {
        template = { body: chosen.body, subject: chosen.subject };
      }
    }
    const result = await this.mailService.sendAssignmentEmail({
      expiresAt: assignment.expiresAt,
      language,
      recipient,
      template,
      url: `${assignment.url}?lang=${language}`
    });
    // The entry must mean the instance's mail identity actually carried this credential toward
    // this address: nothing goes outbound for DISABLED or NO_RECIPIENT, so nothing is recorded.
    if (result.status === 'SENT' || result.status === 'FAILED') {
      await this.auditLogger.log('SEND_EMAIL', 'ASSIGNMENT', {
        groupId: assignment.groupId ?? null,
        metadata: { assignmentId: id, recipient, status: result.status },
        userId: currentUser.id
      });
    }
    return result;
  }

  @ApiOperation({ summary: 'Update Assignment' })
  @Patch(':id')
  @RouteAccess({ action: 'update', subject: 'Assignment' })
  updateById(@Param('id') id: string, @Body() data: UpdateAssignmentDto, @CurrentUser() currentUser: RequestUser) {
    return this.assignmentsService.updateById(id, data, currentUser);
  }
}
