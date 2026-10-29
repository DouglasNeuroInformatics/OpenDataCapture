import { ApiOperation, CurrentUser } from '@douglasneuroinformatics/libnest';
import type { RequestUser } from '@douglasneuroinformatics/libnest';
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import {
  $BulkAssignmentPreflightData,
  $CancelAssignmentData,
  $CreateAssignmentData,
  $CreateBulkAssignmentsData,
  $DeleteBulkAssignmentsData
} from '@opendatacapture/schemas/assignment';
import type {
  Assignment,
  BulkAssignmentPreflightResult,
  DeleteBulkAssignmentsResult
} from '@opendatacapture/schemas/assignment';
import {
  $SendAssignmentEmailData,
  $SendBulkAssignmentEmailData,
  DEFAULT_ASSIGNMENT_EMAIL_TEMPLATE
} from '@opendatacapture/schemas/mail';
import type { EmailDeliveryResult, MailTemplate } from '@opendatacapture/schemas/mail';

import { AuditLogger } from '@/audit/audit.logger';
import type { AppAbility } from '@/auth/auth.types';
import { ASSIGNMENT_EMAIL_THROTTLER_LIMIT, ASSIGNMENT_EMAIL_THROTTLER_TTL } from '@/core/constants';
import { RouteAccess } from '@/core/decorators/route-access.decorator';
import { GroupsService } from '@/groups/groups.service';
import { MailService } from '@/mail/mail.service';
import { redactEmails } from '@/mail/mail.utils';

import { AssignmentsService } from './assignments.service';

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
  // Creates nothing, so it answers 200 rather than the 201 a POST defaults to in Nest.
  @HttpCode(HttpStatus.OK)
  @Post('bulk/preflight')
  @RouteAccess({ action: 'create', subject: 'Assignment' })
  bulkPreflight(
    @Body() data: $BulkAssignmentPreflightData,
    @CurrentUser() currentUser: RequestUser
  ): Promise<BulkAssignmentPreflightResult> {
    return this.assignmentsService.bulkPreflight(data, currentUser);
  }

  @ApiOperation({ summary: 'Create Assignment' })
  @Post()
  @RouteAccess({ action: 'create', subject: 'Assignment' })
  create(@Body() data: $CreateAssignmentData, @CurrentUser() currentUser: RequestUser): Promise<Assignment> {
    return this.assignmentsService.create(data, currentUser);
  }

  @ApiOperation({ summary: 'Create Assignments in Bulk' })
  @Post('bulk')
  @RouteAccess({ action: 'create', subject: 'Assignment' })
  createBulk(@Body() data: $CreateBulkAssignmentsData, @CurrentUser() currentUser: RequestUser): Promise<Assignment[]> {
    return this.assignmentsService.createBulk(data, currentUser);
  }

  @ApiOperation({ summary: 'Delete Assignments in Bulk' })
  @HttpCode(HttpStatus.OK)
  @Post('bulk/delete')
  @RouteAccess({ action: 'delete', subject: 'Assignment' })
  deleteBulk(
    @Body() data: $DeleteBulkAssignmentsData,
    @CurrentUser('ability') ability?: AppAbility
  ): Promise<DeleteBulkAssignmentsResult> {
    return this.assignmentsService.deleteBulk(data.ids, { ability });
  }

  @ApiOperation({ summary: 'Get All Assignments' })
  @Get()
  @RouteAccess({ action: 'read', subject: 'Assignment' })
  find(
    @CurrentUser('ability') ability?: AppAbility,
    @Query('groupId') groupId?: string,
    @Query('subjectId') subjectId?: string
  ): Promise<Assignment[]> {
    return this.assignmentsService.find({ groupId, subjectId }, { ability });
  }

  @ApiOperation({ summary: 'Email Several Assignment Links' })
  // Must stay above `:id/email`, which would otherwise capture `bulk` as an assignment id.
  @Post('bulk/email')
  @RouteAccess({ action: 'update', subject: 'Assignment' })
  // One message rather than one per link, so this costs the same quota as a single-link send.
  @Throttle({ long: { limit: ASSIGNMENT_EMAIL_THROTTLER_LIMIT, ttl: ASSIGNMENT_EMAIL_THROTTLER_TTL } })
  async sendBulkEmail(
    @Body() { assignmentIds, language, recipient, templateId }: $SendBulkAssignmentEmailData,
    @CurrentUser() currentUser: RequestUser
  ): Promise<EmailDeliveryResult> {
    const { ability } = currentUser;
    const assignments = await Promise.all(
      assignmentIds.map((assignmentId) => this.assignmentsService.findById(assignmentId, { ability }))
    );
    // One email is sent on behalf of one group, whose template it is rendered from and whose audit
    // log it is recorded in. Links from two groups in one message would have to pick one of each.
    const groupIds = new Set(assignments.map((assignment) => assignment.groupId ?? null));
    if (groupIds.size > 1) {
      throw new BadRequestException('Every assignment in one email must belong to the same group');
    }
    const [groupId] = groupIds;
    const result = await this.mailService.sendAssignmentEmail({
      language,
      links: assignments.map((assignment) => ({
        expiresAt: assignment.expiresAt,
        url: `${assignment.url}?lang=${language}`
      })),
      recipient,
      template: await this.resolveTemplate(groupId ?? null, templateId, ability)
    });
    await this.logEmail(result, { assignmentIds, groupId: groupId ?? null, recipient, userId: currentUser.id });
    return result;
  }

  @ApiOperation({ summary: 'Email Assignment Link' })
  @Post(':id/email')
  @RouteAccess({ action: 'update', subject: 'Assignment' })
  // This route makes the instance's mail identity deliver a live assignment credential to a
  // caller-supplied address, so it is bounded independently of the global default.
  @Throttle({ long: { limit: ASSIGNMENT_EMAIL_THROTTLER_LIMIT, ttl: ASSIGNMENT_EMAIL_THROTTLER_TTL } })
  async sendEmail(
    @Param('id') id: string,
    @Body() { language, recipient, templateId }: $SendAssignmentEmailData,
    @CurrentUser() currentUser: RequestUser
  ): Promise<EmailDeliveryResult> {
    const { ability } = currentUser;
    const assignment = await this.assignmentsService.findById(id, { ability });
    const result = await this.mailService.sendAssignmentEmail({
      language,
      links: [{ expiresAt: assignment.expiresAt, url: `${assignment.url}?lang=${language}` }],
      recipient,
      template: await this.resolveTemplate(assignment.groupId ?? null, templateId, ability)
    });
    await this.logEmail(result, {
      assignmentIds: [id],
      groupId: assignment.groupId ?? null,
      recipient,
      userId: currentUser.id
    });
    return result;
  }

  @ApiOperation({ summary: 'Update Assignment' })
  @Patch(':id')
  @RouteAccess({ action: 'update', subject: 'Assignment' })
  updateById(@Param('id') id: string, @Body() data: $CancelAssignmentData, @CurrentUser() currentUser: RequestUser) {
    return this.assignmentsService.updateById(id, data, currentUser);
  }

  /**
   * Record that the instance's mail identity carried these credentials toward this address. Nothing
   * goes outbound for DISABLED or NO_RECIPIENT, so nothing is recorded. Every admin reads the audit
   * log, so it keeps only the masked address.
   */
  private async logEmail(
    result: EmailDeliveryResult,
    {
      assignmentIds,
      groupId,
      recipient,
      userId
    }: { assignmentIds: string[]; groupId: null | string; recipient: string; userId: string }
  ): Promise<void> {
    if (result.status !== 'SENT' && result.status !== 'FAILED') {
      return;
    }
    // One entry per link, since each is a credential of its own however many shared the message.
    for (const assignmentId of assignmentIds) {
      await this.auditLogger.log('SEND_EMAIL', 'ASSIGNMENT', {
        groupId,
        metadata: { assignmentId, recipient: redactEmails(recipient), status: result.status },
        userId
      });
    }
  }

  /**
   * Choose the requested template if given (null selects the built-in default), else the group's
   * active one, falling back to the default when the active id resolves to nothing.
   */
  private async resolveTemplate(
    groupId: null | string,
    templateId: null | string | undefined,
    ability: AppAbility
  ): Promise<MailTemplate> {
    if (!groupId) {
      return { ...DEFAULT_ASSIGNMENT_EMAIL_TEMPLATE };
    }
    const group = await this.groupsService.findById(groupId, { ability });
    const targetId = templateId === undefined ? group.activeAssignmentEmailTemplateId : templateId;
    const chosen = group.emailTemplates?.find(({ id }) => id === targetId);
    // An explicitly requested template that no longer exists must not become a silent substitution
    // of wording the caller never chose — it was deleted under their open form.
    if (templateId && !chosen) {
      throw new BadRequestException(`No email template with id '${templateId}' exists in this group`);
    }
    return chosen?.body && chosen.subject
      ? { body: chosen.body, subject: chosen.subject }
      : { ...DEFAULT_ASSIGNMENT_EMAIL_TEMPLATE };
  }
}
