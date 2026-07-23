import { CurrentUser } from '@douglasneuroinformatics/libnest';
import type { RequestUser } from '@douglasneuroinformatics/libnest';
import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import type { Assignment } from '@opendatacapture/schemas/assignment';
import { DEFAULT_ASSIGNMENT_EMAIL_TEMPLATE } from '@opendatacapture/schemas/mail';
import type { EmailDeliveryResult, MailTemplate } from '@opendatacapture/schemas/mail';

import type { AppAbility } from '@/auth/auth.types';
import { RouteAccess } from '@/core/decorators/route-access.decorator';
import { GroupsService } from '@/groups/groups.service';
import { MailService } from '@/mail/mail.service';
import { pickLocale } from '@/mail/mail.utils';

import { AssignmentsService } from './assignments.service';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { SendAssignmentEmailDto } from './dto/send-assignment-email.dto';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';

@Controller('assignments')
export class AssignmentsController {
  constructor(
    private readonly assignmentsService: AssignmentsService,
    private readonly groupsService: GroupsService,
    private readonly mailService: MailService
  ) {}

  @ApiOperation({ summary: 'Create Assignment' })
  @Post()
  @RouteAccess({ action: 'create', subject: 'Assignment' })
  create(@Body() data: CreateAssignmentDto, @CurrentUser() currentUser: RequestUser): Promise<Assignment> {
    return this.assignmentsService.create(data, currentUser);
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
  async sendEmail(
    @Param('id') id: string,
    @Body() { language, recipient, templateId }: SendAssignmentEmailDto,
    @CurrentUser('ability') ability: AppAbility
  ): Promise<EmailDeliveryResult> {
    const assignment = await this.assignmentsService.findById(id, { ability });
    // Choose the requested template if given, else the group's active one; either way falling back
    // to the built-in default when the id resolves to nothing (e.g. null selects the default).
    let template: MailTemplate = { ...DEFAULT_ASSIGNMENT_EMAIL_TEMPLATE };
    if (assignment.groupId) {
      const group = await this.groupsService.findById(assignment.groupId, { ability });
      const targetId = templateId === undefined ? group.activeAssignmentEmailTemplateId : templateId;
      const chosen = group.emailTemplates?.find(
        ({ category, id }) => category === 'REMOTE_ASSIGNMENT' && id === targetId
      );
      if (chosen?.body && chosen?.subject) {
        template = { body: chosen.body, subject: chosen.subject };
      }
    }
    return this.mailService.sendAssignmentEmail({
      body: pickLocale(template.body, language),
      expiresAt: new Date(assignment.expiresAt).toISOString().slice(0, 10),
      recipient,
      subject: pickLocale(template.subject, language),
      url: `${assignment.url}?lang=${language}`
    });
  }

  @ApiOperation({ summary: 'Update Assignment' })
  @Patch(':id')
  @RouteAccess({ action: 'update', subject: 'Assignment' })
  updateById(@Param('id') id: string, @Body() data: UpdateAssignmentDto, @CurrentUser() currentUser: RequestUser) {
    return this.assignmentsService.updateById(id, data, currentUser);
  }
}
