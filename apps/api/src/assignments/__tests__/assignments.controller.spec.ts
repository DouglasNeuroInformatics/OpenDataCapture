import type { RequestUser } from '@douglasneuroinformatics/libnest';
import { MockFactory } from '@douglasneuroinformatics/libnest/testing';
import type { MockedInstance } from '@douglasneuroinformatics/libnest/testing';
import { Test } from '@nestjs/testing';
import type { Language } from '@opendatacapture/schemas/core';
import { DEFAULT_ASSIGNMENT_EMAIL_TEMPLATE } from '@opendatacapture/schemas/mail';
import { beforeEach, describe, expect, it } from 'vitest';

import { AuditLogger } from '@/audit/audit.logger';
import type { AppAbility } from '@/auth/auth.types';
import { GroupsService } from '@/groups/groups.service';
import { MailService } from '@/mail/mail.service';

import { AssignmentsController } from '../assignments.controller';
import { AssignmentsService } from '../assignments.service';

const currentUser = { ability: {} as AppAbility, id: 'user-1' } as RequestUser;

const assignment = {
  expiresAt: new Date('2026-08-01T12:00:00.000Z'),
  groupId: 'group-1',
  id: 'assignment-1',
  url: 'https://gateway.example.org/assignments/abc'
};

const customTemplate = {
  body: { en: 'Custom body {{url}}', fr: 'Corps personnalisé {{url}}' },
  id: 'tpl-1',
  name: 'Custom',
  subject: { en: 'Custom subject', fr: 'Objet personnalisé' }
};

describe('AssignmentsController', () => {
  let assignmentsController: AssignmentsController;
  let assignmentsService: MockedInstance<AssignmentsService>;
  let auditLogger: MockedInstance<AuditLogger>;
  let groupsService: MockedInstance<GroupsService>;
  let mailService: MockedInstance<MailService>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AssignmentsController],
      providers: [
        MockFactory.createForService(AssignmentsService),
        MockFactory.createForService(AuditLogger),
        MockFactory.createForService(GroupsService),
        MockFactory.createForService(MailService)
      ]
    }).compile();
    assignmentsController = moduleRef.get(AssignmentsController);
    assignmentsService = moduleRef.get(AssignmentsService);
    auditLogger = moduleRef.get(AuditLogger);
    groupsService = moduleRef.get(GroupsService);
    mailService = moduleRef.get(MailService);
  });

  it('should be defined', () => {
    expect(assignmentsController).toBeDefined();
  });

  describe('sendEmail', () => {
    const sendEmail = (body: { language: Language; recipient: string; templateId?: null | string }) =>
      assignmentsController.sendEmail('assignment-1', body, currentUser);

    it('uses the built-in default template when the assignment has no group', async () => {
      assignmentsService.findById.mockResolvedValueOnce({ ...assignment, groupId: null });
      await sendEmail({ language: 'en', recipient: 'p@x.org' });
      expect(groupsService.findById).not.toHaveBeenCalled();
      expect(mailService.sendAssignmentEmail.mock.lastCall?.[0]).toMatchObject({
        recipient: 'p@x.org',
        template: DEFAULT_ASSIGNMENT_EMAIL_TEMPLATE,
        url: `${assignment.url}?lang=en`
      });
    });

    // Rendering is the mail service's job, so the raw date has to survive the hand-off — a
    // pre-formatted string here would be formatted twice.
    it('forwards the raw expiry rather than a formatted date', async () => {
      assignmentsService.findById.mockResolvedValueOnce({ ...assignment, groupId: null });
      await sendEmail({ language: 'en', recipient: 'p@x.org' });
      expect(mailService.sendAssignmentEmail.mock.lastCall?.[0]).toMatchObject({
        expiresAt: assignment.expiresAt
      });
    });

    it("uses the group's active template when no template id is given", async () => {
      assignmentsService.findById.mockResolvedValueOnce(assignment);
      groupsService.findById.mockResolvedValueOnce({
        activeAssignmentEmailTemplateId: 'tpl-1',
        emailTemplates: [customTemplate]
      });
      await sendEmail({ language: 'en', recipient: 'p@x.org' });
      expect(mailService.sendAssignmentEmail.mock.lastCall?.[0]).toMatchObject({
        template: { body: customTemplate.body, subject: customTemplate.subject }
      });
    });

    it('uses the explicitly requested template over the active one', async () => {
      assignmentsService.findById.mockResolvedValueOnce(assignment);
      groupsService.findById.mockResolvedValueOnce({
        activeAssignmentEmailTemplateId: 'tpl-other',
        emailTemplates: [customTemplate]
      });
      await sendEmail({ language: 'en', recipient: 'p@x.org', templateId: 'tpl-1' });
      expect(mailService.sendAssignmentEmail.mock.lastCall?.[0]).toMatchObject({
        template: { body: customTemplate.body, subject: customTemplate.subject }
      });
    });

    it('uses the default template when the template id is null, even if an active template is set', async () => {
      assignmentsService.findById.mockResolvedValueOnce(assignment);
      groupsService.findById.mockResolvedValueOnce({
        activeAssignmentEmailTemplateId: 'tpl-1',
        emailTemplates: [customTemplate]
      });
      await sendEmail({ language: 'en', recipient: 'p@x.org', templateId: null });
      expect(mailService.sendAssignmentEmail.mock.lastCall?.[0]).toMatchObject({
        template: DEFAULT_ASSIGNMENT_EMAIL_TEMPLATE
      });
    });

    it('passes the requested language through for the mail service to render', async () => {
      assignmentsService.findById.mockResolvedValueOnce(assignment);
      groupsService.findById.mockResolvedValueOnce({
        activeAssignmentEmailTemplateId: 'tpl-1',
        emailTemplates: [customTemplate]
      });
      await sendEmail({ language: 'fr', recipient: 'p@x.org' });
      expect(mailService.sendAssignmentEmail.mock.lastCall?.[0]).toMatchObject({
        language: 'fr',
        url: `${assignment.url}?lang=fr`
      });
    });

    it('records an audit log entry against the assignment group', async () => {
      assignmentsService.findById.mockResolvedValueOnce(assignment);
      groupsService.findById.mockResolvedValueOnce({ emailTemplates: [] });
      await sendEmail({ language: 'en', recipient: 'p@x.org' });
      expect(auditLogger.log).toHaveBeenCalledWith('SEND_EMAIL', 'ASSIGNMENT', {
        groupId: 'group-1',
        userId: 'user-1'
      });
    });

    it('returns the delivery result from the mail service', async () => {
      assignmentsService.findById.mockResolvedValueOnce({ ...assignment, groupId: null });
      mailService.sendAssignmentEmail.mockResolvedValueOnce({
        message: 'rendered',
        recipient: 'p@x.org',
        status: 'SENT'
      });
      await expect(sendEmail({ language: 'en', recipient: 'p@x.org' })).resolves.toMatchObject({ status: 'SENT' });
    });
  });
});
