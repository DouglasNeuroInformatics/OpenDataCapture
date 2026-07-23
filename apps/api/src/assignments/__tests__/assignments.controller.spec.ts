import { MockFactory } from '@douglasneuroinformatics/libnest/testing';
import type { MockedInstance } from '@douglasneuroinformatics/libnest/testing';
import { Test } from '@nestjs/testing';
import type { MailLanguage } from '@opendatacapture/schemas/mail';
import { DEFAULT_ASSIGNMENT_EMAIL_TEMPLATE } from '@opendatacapture/schemas/mail';
import { beforeEach, describe, expect, it } from 'vitest';

import type { AppAbility } from '@/auth/auth.types';
import { GroupsService } from '@/groups/groups.service';
import { MailService } from '@/mail/mail.service';

import { AssignmentsController } from '../assignments.controller';
import { AssignmentsService } from '../assignments.service';

const ability = {} as AppAbility;

const assignment = {
  expiresAt: new Date('2026-08-01T12:00:00.000Z'),
  groupId: 'group-1',
  id: 'assignment-1',
  url: 'https://gateway.example.org/assignments/abc'
};

const customTemplate = {
  body: { en: 'Custom body {{url}}', fr: 'Corps personnalisé {{url}}' },
  category: 'REMOTE_ASSIGNMENT',
  id: 'tpl-1',
  name: 'Custom',
  subject: { en: 'Custom subject', fr: 'Objet personnalisé' }
};

describe('AssignmentsController', () => {
  let assignmentsController: AssignmentsController;
  let assignmentsService: MockedInstance<AssignmentsService>;
  let groupsService: MockedInstance<GroupsService>;
  let mailService: MockedInstance<MailService>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AssignmentsController],
      providers: [
        MockFactory.createForService(AssignmentsService),
        MockFactory.createForService(GroupsService),
        MockFactory.createForService(MailService)
      ]
    }).compile();
    assignmentsController = moduleRef.get(AssignmentsController);
    assignmentsService = moduleRef.get(AssignmentsService);
    groupsService = moduleRef.get(GroupsService);
    mailService = moduleRef.get(MailService);
  });

  it('should be defined', () => {
    expect(assignmentsController).toBeDefined();
  });

  describe('sendEmail', () => {
    const sendEmail = (body: { language: MailLanguage; recipient: string; templateId?: null | string }) =>
      assignmentsController.sendEmail('assignment-1', body, ability);

    it('uses the built-in default template when the assignment has no group', async () => {
      assignmentsService.findById.mockResolvedValueOnce({ ...assignment, groupId: null });
      await sendEmail({ language: 'en', recipient: 'p@x.org' });
      expect(groupsService.findById).not.toHaveBeenCalled();
      expect(mailService.sendAssignmentEmail.mock.lastCall?.[0]).toMatchObject({
        body: DEFAULT_ASSIGNMENT_EMAIL_TEMPLATE.body.en,
        expiresAt: '2026-08-01',
        recipient: 'p@x.org',
        subject: DEFAULT_ASSIGNMENT_EMAIL_TEMPLATE.subject.en,
        url: `${assignment.url}?lang=en`
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
        body: customTemplate.body.en,
        subject: customTemplate.subject.en
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
        body: customTemplate.body.en,
        subject: customTemplate.subject.en
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
        body: DEFAULT_ASSIGNMENT_EMAIL_TEMPLATE.body.en,
        subject: DEFAULT_ASSIGNMENT_EMAIL_TEMPLATE.subject.en
      });
    });

    it('ignores a matching template of the wrong category', async () => {
      assignmentsService.findById.mockResolvedValueOnce(assignment);
      groupsService.findById.mockResolvedValueOnce({
        activeAssignmentEmailTemplateId: 'tpl-1',
        emailTemplates: [{ ...customTemplate, category: 'INFORMATION' }]
      });
      await sendEmail({ language: 'en', recipient: 'p@x.org' });
      expect(mailService.sendAssignmentEmail.mock.lastCall?.[0]).toMatchObject({
        body: DEFAULT_ASSIGNMENT_EMAIL_TEMPLATE.body.en,
        subject: DEFAULT_ASSIGNMENT_EMAIL_TEMPLATE.subject.en
      });
    });

    it('sends the French content when language is fr', async () => {
      assignmentsService.findById.mockResolvedValueOnce(assignment);
      groupsService.findById.mockResolvedValueOnce({
        activeAssignmentEmailTemplateId: 'tpl-1',
        emailTemplates: [customTemplate]
      });
      await sendEmail({ language: 'fr', recipient: 'p@x.org' });
      expect(mailService.sendAssignmentEmail.mock.lastCall?.[0]).toMatchObject({
        body: customTemplate.body.fr,
        subject: customTemplate.subject.fr
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
