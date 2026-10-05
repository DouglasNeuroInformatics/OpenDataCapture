import type { RequestUser } from '@douglasneuroinformatics/libnest';
import { MockFactory } from '@douglasneuroinformatics/libnest/testing';
import type { MockedInstance } from '@douglasneuroinformatics/libnest/testing';
import { BadRequestException } from '@nestjs/common';
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
    mailService.sendAssignmentEmail.mockResolvedValue({ message: 'rendered', recipient: 'p@x.org', status: 'SENT' });
  });

  it('should be defined', () => {
    expect(assignmentsController).toBeDefined();
  });

  describe('bulkPreflight', () => {
    it('should validate the batch as the current user, so the service applies their group and subject scoping', async () => {
      const data = { allowDuplicates: false, groupId: 'group-1', subjectIds: ['subject-1'], timepoints: [] };
      const preflight = { assignmentCount: 0, subjectCount: 1, timepointCount: 0 };
      assignmentsService.bulkPreflight.mockResolvedValueOnce(preflight);
      await expect(assignmentsController.bulkPreflight(data, currentUser)).resolves.toBe(preflight);
      expect(assignmentsService.bulkPreflight).toHaveBeenCalledExactlyOnceWith(data, currentUser);
    });
  });

  describe('create', () => {
    it('should create the assignment as the current user, so the service can check and audit it', async () => {
      const data = { expiresAt: assignment.expiresAt, groupId: 'group-1', instrumentId: 'i-1', subjectId: 's-1' };
      assignmentsService.create.mockResolvedValueOnce(assignment);
      await expect(assignmentsController.create(data, currentUser)).resolves.toBe(assignment);
      expect(assignmentsService.create).toHaveBeenCalledExactlyOnceWith(data, currentUser);
    });
  });

  describe('createBulk', () => {
    it('should create the batch as the current user, so the service can check and audit it', async () => {
      const data = { allowDuplicates: true, groupId: 'group-1', subjectIds: ['subject-1'], timepoints: [] };
      assignmentsService.createBulk.mockResolvedValueOnce([assignment]);
      await expect(assignmentsController.createBulk(data, currentUser)).resolves.toStrictEqual([assignment]);
      expect(assignmentsService.createBulk).toHaveBeenCalledExactlyOnceWith(data, currentUser);
    });
  });

  describe('deleteBulk', () => {
    it('should forward the requested ids with the caller ability, so the service can scope the deletion', async () => {
      const result = { deletedCount: 2, failedIds: [] };
      assignmentsService.deleteBulk.mockResolvedValueOnce(result);
      await expect(assignmentsController.deleteBulk({ ids: ['a-1', 'a-2'] }, currentUser.ability)).resolves.toBe(
        result
      );
      expect(assignmentsService.deleteBulk).toHaveBeenCalledExactlyOnceWith(['a-1', 'a-2'], {
        ability: currentUser.ability
      });
    });
  });

  describe('find', () => {
    it('should filter by the requested group and subject within the caller ability', async () => {
      assignmentsService.find.mockResolvedValueOnce([assignment]);
      await expect(assignmentsController.find(currentUser.ability, 'group-1', 'subject-1')).resolves.toStrictEqual([
        assignment
      ]);
      expect(assignmentsService.find).toHaveBeenCalledExactlyOnceWith(
        { groupId: 'group-1', subjectId: 'subject-1' },
        { ability: currentUser.ability }
      );
    });
  });

  describe('updateById', () => {
    it('should update the assignment as the current user, so the service can scope and audit it', async () => {
      assignmentsService.updateById.mockResolvedValueOnce({ ...assignment, status: 'CANCELED' });
      await expect(
        assignmentsController.updateById('assignment-1', { status: 'CANCELED' }, currentUser)
      ).resolves.toMatchObject({ status: 'CANCELED' });
      expect(assignmentsService.updateById).toHaveBeenCalledExactlyOnceWith(
        'assignment-1',
        { status: 'CANCELED' },
        currentUser
      );
    });
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

    // A manager can delete a template while a clinician's send form is open; silently sending
    // the built-in wording instead, and reporting it SENT, would hide that from both of them.
    it('rejects an explicit template id that resolves to nothing rather than substituting the default', async () => {
      assignmentsService.findById.mockResolvedValueOnce(assignment);
      groupsService.findById.mockResolvedValueOnce({
        activeAssignmentEmailTemplateId: null,
        emailTemplates: [customTemplate]
      });
      await expect(
        sendEmail({ language: 'en', recipient: 'p@x.org', templateId: 'tpl-deleted' })
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(mailService.sendAssignmentEmail).not.toHaveBeenCalled();
    });

    // The active id is the group's own setting, not something this caller chose, so falling back
    // to the built-in default is the documented behaviour rather than a substitution.
    it('falls back to the default template when the active template id resolves to nothing', async () => {
      assignmentsService.findById.mockResolvedValueOnce(assignment);
      groupsService.findById.mockResolvedValueOnce({
        activeAssignmentEmailTemplateId: 'tpl-gone',
        emailTemplates: []
      });
      await sendEmail({ language: 'en', recipient: 'p@x.org' });
      expect(mailService.sendAssignmentEmail.mock.lastCall?.[0]).toMatchObject({
        template: DEFAULT_ASSIGNMENT_EMAIL_TEMPLATE
      });
    });

    // Without this, dropping `{ ability }` from either lookup would leave every other test green
    // while the route reads assignments and groups across every group.
    it('scopes the assignment and group lookups to the caller ability', async () => {
      assignmentsService.findById.mockResolvedValueOnce(assignment);
      groupsService.findById.mockResolvedValueOnce({ emailTemplates: [] });
      await sendEmail({ language: 'en', recipient: 'p@x.org' });
      expect(assignmentsService.findById).toHaveBeenCalledWith('assignment-1', { ability: currentUser.ability });
      expect(groupsService.findById).toHaveBeenCalledWith('group-1', { ability: currentUser.ability });
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

    // Every admin reads the audit log, so it records the domain the link went to, not the address.
    it('records who sent what to which masked address, with the outcome, in the audit entry', async () => {
      assignmentsService.findById.mockResolvedValueOnce(assignment);
      groupsService.findById.mockResolvedValueOnce({ emailTemplates: [] });
      await sendEmail({ language: 'en', recipient: 'participant@x.org' });
      expect(auditLogger.log).toHaveBeenCalledWith('SEND_EMAIL', 'ASSIGNMENT', {
        groupId: 'group-1',
        metadata: { assignmentId: 'assignment-1', recipient: 'p***@x.org', status: 'SENT' },
        userId: 'user-1'
      });
    });

    it('records a failed delivery attempt in the audit log', async () => {
      assignmentsService.findById.mockResolvedValueOnce({ ...assignment, groupId: null });
      mailService.sendAssignmentEmail.mockResolvedValueOnce({
        error: 'CONNECTION_REFUSED',
        message: 'rendered',
        recipient: 'p@x.org',
        status: 'FAILED'
      });
      await sendEmail({ language: 'en', recipient: 'p@x.org' });
      expect(auditLogger.log.mock.lastCall?.[2]).toMatchObject({ metadata: { status: 'FAILED' } });
    });

    // The entry means the mail identity actually carried the credential toward the address;
    // recording attempts that never went outbound would make the log lie about that.
    it('does not record an audit entry when mail is disabled', async () => {
      assignmentsService.findById.mockResolvedValueOnce({ ...assignment, groupId: null });
      mailService.sendAssignmentEmail.mockResolvedValueOnce({
        message: 'rendered',
        recipient: 'p@x.org',
        status: 'DISABLED'
      });
      await sendEmail({ language: 'en', recipient: 'p@x.org' });
      expect(auditLogger.log).not.toHaveBeenCalled();
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

    // The clinician who typed the address needs it back to send the message by hand.
    it('returns the full recipient to the caller even though the audit entry masks it', async () => {
      assignmentsService.findById.mockResolvedValueOnce({ ...assignment, groupId: null });
      mailService.sendAssignmentEmail.mockResolvedValueOnce({
        message: 'rendered',
        recipient: 'participant@x.org',
        status: 'SENT'
      });
      await expect(sendEmail({ language: 'en', recipient: 'participant@x.org' })).resolves.toMatchObject({
        recipient: 'participant@x.org'
      });
    });
  });
});
