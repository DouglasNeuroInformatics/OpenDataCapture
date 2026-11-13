import type { Model, RequestUser } from '@douglasneuroinformatics/libnest';
import { getModelToken } from '@douglasneuroinformatics/libnest';
import { MockFactory } from '@douglasneuroinformatics/libnest/testing';
import type { MockedInstance } from '@douglasneuroinformatics/libnest/testing';
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { beforeEach, describe, expect, it } from 'vitest';

import { AuditLogger } from '@/audit/audit.logger';
import { createAppAbility } from '@/auth/ability.utils';

import { GroupsService } from '../groups.service';

const admin = {
  ability: createAppAbility([{ action: 'manage', subject: 'all' }]),
  id: 'admin-1'
} as RequestUser;

/** A minimal template satisfying `$GroupEmailTemplate`, which requires renderable content. */
const template = (id: string, name: string) => ({
  body: { en: 'Link {{url}}' },
  id,
  name,
  subject: { en: 'Subject' }
});

describe('GroupsService', () => {
  let auditLogger: MockedInstance<AuditLogger>;
  let groupsService: GroupsService;
  let groupModel: MockedInstance<Model<'Group'>>;
  let instrumentModel: MockedInstance<Model<'Instrument'>>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        GroupsService,
        MockFactory.createForModelToken(getModelToken('Group')),
        MockFactory.createForModelToken(getModelToken('Instrument')),
        MockFactory.createForService(AuditLogger)
      ]
    }).compile();
    auditLogger = moduleRef.get(AuditLogger);
    groupModel = moduleRef.get(getModelToken('Group'));
    instrumentModel = moduleRef.get(getModelToken('Instrument'));
    groupsService = moduleRef.get(GroupsService);
    instrumentModel.findMany.mockResolvedValue([]);
  });

  describe('create', () => {
    it('should call the group model', async () => {
      await groupsService.create({ name: 'Test Group', type: 'CLINICAL' });
      expect(groupModel.create.mock.lastCall?.[0]).toMatchObject({ data: { name: 'Test Group' } });
    });

    it('should connect only shared non-repo instruments, matching an absent field as well as a null one, so an uploaded instrument is not skipped', async () => {
      instrumentModel.findMany.mockResolvedValueOnce([{ id: 'manual-1' }, { id: 'manual-2' }]);
      await groupsService.create({ name: 'Test Group', type: 'CLINICAL' });
      expect(instrumentModel.findMany).toHaveBeenCalledWith({
        where: {
          AND: [
            { OR: [{ seriesGroupId: null }, { seriesGroupId: { isSet: false } }] },
            { OR: [{ sourceRepoId: null }, { sourceRepoId: { isSet: false } }] }
          ]
        }
      });
      expect(groupModel.create.mock.lastCall?.[0]).toMatchObject({
        data: { accessibleInstruments: { connect: [{ id: 'manual-1' }, { id: 'manual-2' }] } }
      });
    });

    it('should identify subjects by personal information by default in a clinical group', async () => {
      await groupsService.create({ name: 'Test Group', type: 'CLINICAL' });
      expect(groupModel.create.mock.lastCall?.[0]).toMatchObject({
        data: { settings: { defaultIdentificationMethod: 'PERSONAL_INFO' } }
      });
    });

    it('should identify subjects by custom id by default in a research group', async () => {
      await groupsService.create({ name: 'Test Group', type: 'RESEARCH' });
      expect(groupModel.create.mock.lastCall?.[0]).toMatchObject({
        data: { settings: { defaultIdentificationMethod: 'CUSTOM_ID' } }
      });
    });

    it('should let explicit settings override the default identification method', async () => {
      await groupsService.create({
        name: 'Test Group',
        settings: { defaultIdentificationMethod: 'CUSTOM_ID' },
        type: 'CLINICAL'
      });
      expect(groupModel.create.mock.lastCall?.[0]).toMatchObject({
        data: { settings: { defaultIdentificationMethod: 'CUSTOM_ID' } }
      });
    });

    it('should throw a ConflictException if a group with the same name already exists in the db', async () => {
      groupModel.exists.mockResolvedValueOnce(true);
      await expect(groupsService.create({ name: 'Test Group', type: 'CLINICAL' })).rejects.toBeInstanceOf(
        ConflictException
      );
    });
  });

  describe('archiveById', () => {
    it('should set archivedAt rather than delete the group, so everything naming it keeps a real owner', async () => {
      groupModel.findFirst.mockResolvedValueOnce({ archivedAt: null, id: '123' });
      await groupsService.archiveById('123', admin);
      expect(groupModel.update.mock.lastCall?.[0].data.archivedAt).toBeInstanceOf(Date);
      expect(groupModel.update.mock.lastCall?.[0].where).toMatchObject({ id: '123' });
    });

    it('should return the archived group', async () => {
      groupModel.findFirst.mockResolvedValueOnce({ archivedAt: null, id: '123' });
      groupModel.update.mockResolvedValueOnce({ archivedAt: new Date(), id: '123' });
      await expect(groupsService.archiveById('123', admin)).resolves.toMatchObject({ archivedAt: expect.any(Date) });
    });

    it("should restrict the archive to groups the caller's ability may update", async () => {
      const currentUser = {
        ability: createAppAbility([{ action: 'update', conditions: { id: 'group-1' }, subject: 'Group' }]),
        id: 'user-1'
      } as RequestUser;
      groupModel.findFirst.mockResolvedValueOnce({ archivedAt: null, id: '123' });
      await groupsService.archiveById('123', currentUser);
      const where = { AND: [{ OR: [{ id: 'group-1' }] }], id: '123' };
      expect(groupModel.findFirst.mock.lastCall?.[0]).toEqual({ where });
      expect(groupModel.update.mock.lastCall?.[0].where).toEqual(where);
    });

    it('should throw a NotFoundException when no accessible group has the provided id', async () => {
      groupModel.findFirst.mockResolvedValueOnce(null);
      await expect(groupsService.archiveById('123', admin)).rejects.toBeInstanceOf(NotFoundException);
      expect(groupModel.update).not.toHaveBeenCalled();
    });

    it('should record the archive in the audit log under the group', async () => {
      groupModel.findFirst.mockResolvedValueOnce({ archivedAt: null, id: '123' });
      await groupsService.archiveById('123', admin);
      expect(auditLogger.log).toHaveBeenCalledExactlyOnceWith('ARCHIVE', 'GROUP', {
        groupId: '123',
        userId: 'admin-1'
      });
    });

    it('should leave an archived group alone, so it keeps the date it was first archived', async () => {
      const group = { archivedAt: new Date('2026-01-01T00:00:00.000Z'), id: '123' };
      groupModel.findFirst.mockResolvedValueOnce(group);
      await expect(groupsService.archiveById('123', admin)).resolves.toBe(group);
      expect(groupModel.update).not.toHaveBeenCalled();
      expect(auditLogger.log).not.toHaveBeenCalled();
    });
  });

  describe('unarchiveById', () => {
    it('should clear archivedAt to return the group to service', async () => {
      groupModel.findFirst.mockResolvedValueOnce({ archivedAt: new Date(), id: '123' });
      await groupsService.unarchiveById('123', admin);
      expect(groupModel.update.mock.lastCall?.[0]).toMatchObject({ data: { archivedAt: null }, where: { id: '123' } });
    });

    it('should record the unarchive in the audit log under the group', async () => {
      groupModel.findFirst.mockResolvedValueOnce({ archivedAt: new Date(), id: '123' });
      await groupsService.unarchiveById('123', admin);
      expect(auditLogger.log).toHaveBeenCalledExactlyOnceWith('UNARCHIVE', 'GROUP', {
        groupId: '123',
        userId: 'admin-1'
      });
    });

    it('should leave a group that is not archived alone, since there is nothing to undo', async () => {
      groupModel.findFirst.mockResolvedValueOnce({ archivedAt: null, id: '123' });
      await groupsService.unarchiveById('123', admin);
      expect(groupModel.update).not.toHaveBeenCalled();
      expect(auditLogger.log).not.toHaveBeenCalled();
    });
  });

  describe('updateById', () => {
    it('should throw a NotFoundException when no accessible group has the provided id', async () => {
      groupModel.findFirst.mockResolvedValueOnce(null);
      await expect(groupsService.updateById('123', { name: 'Test Group' })).rejects.toBeInstanceOf(NotFoundException);
      expect(groupModel.update).not.toHaveBeenCalled();
    });

    it('should set the instrumentRepos relation from instrumentRepoIds', async () => {
      groupModel.findFirst.mockResolvedValueOnce({ name: 'Test Group', settings: {} });
      await groupsService.updateById('123', { instrumentRepoIds: ['repo-1', 'repo-2'] });
      expect(groupModel.update.mock.lastCall?.[0]).toMatchObject({
        data: { instrumentRepos: { set: [{ id: 'repo-1' }, { id: 'repo-2' }] } }
      });
    });

    it('should drop accessibleInstrumentIds that no longer exist before setting the relation', async () => {
      groupModel.findFirst.mockResolvedValueOnce({ name: 'Test Group', settings: {} });
      // 'deleted' was removed since the client loaded the group and must not reach the relation set.
      instrumentModel.findMany.mockResolvedValueOnce([{ id: 'live-1' }, { id: 'live-2' }]);
      await groupsService.updateById('123', { accessibleInstrumentIds: ['live-1', 'deleted', 'live-2'] });
      expect(instrumentModel.findMany).toHaveBeenCalledWith({
        select: { id: true },
        where: {
          id: { in: ['live-1', 'deleted', 'live-2'] },
          OR: [{ seriesGroupId: null }, { seriesGroupId: { isSet: false } }, { seriesGroupId: '123' }]
        }
      });
      expect(groupModel.update.mock.lastCall?.[0]).toMatchObject({
        data: { accessibleInstruments: { set: [{ id: 'live-1' }, { id: 'live-2' }] } }
      });
    });

    it('should not throw when the name is unchanged', async () => {
      groupModel.findFirst.mockResolvedValueOnce({ name: 'Test Group', settings: {} });
      await groupsService.updateById('123', { name: 'Test Group' });
      // The current name must not be treated as a collision with itself.
      expect(groupModel.exists).not.toHaveBeenCalled();
      expect(groupModel.update).toHaveBeenCalled();
    });

    it('should write the email template list as a composite set', async () => {
      const templates = [{ body: { en: 'Link {{url}}' }, id: 'tpl-1', name: 'One', subject: { en: 'Subject' } }];
      groupModel.findFirst.mockResolvedValueOnce({ settings: {}, updatedAt: new Date('2026-07-01T00:00:00Z') });
      await groupsService.updateById('123', {
        activeAssignmentEmailTemplateId: 'tpl-1',
        emailTemplates: templates,
        expectedUpdatedAt: new Date('2026-07-01T00:00:00Z')
      });
      expect(groupModel.update.mock.lastCall?.[0]).toMatchObject({ data: { emailTemplates: { set: templates } } });
    });

    // A duplicate id makes `find()` shadow every match after the first.
    it('should reject duplicate template ids', async () => {
      groupModel.findFirst.mockResolvedValueOnce({ settings: {}, updatedAt: new Date('2026-07-01T00:00:00Z') });
      await expect(
        groupsService.updateById('123', {
          emailTemplates: [template('tpl-1', 'One'), template('tpl-1', 'Two')],
          expectedUpdatedAt: new Date('2026-07-01T00:00:00Z')
        })
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    // A dangling active id makes participants silently receive the built-in wording.
    it('should reject an active template id that resolves to nothing', async () => {
      groupModel.findFirst.mockResolvedValueOnce({ settings: {}, updatedAt: new Date('2026-07-01T00:00:00Z') });
      await expect(
        groupsService.updateById('123', {
          activeAssignmentEmailTemplateId: 'tpl-gone',
          emailTemplates: [template('tpl-1', 'One')],
          expectedUpdatedAt: new Date('2026-07-01T00:00:00Z')
        })
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('should accept a null active id, which selects the built-in default', async () => {
      groupModel.findFirst.mockResolvedValueOnce({ settings: {}, updatedAt: new Date('2026-07-01T00:00:00Z') });
      await groupsService.updateById('123', {
        activeAssignmentEmailTemplateId: null,
        emailTemplates: [template('tpl-1', 'One')],
        expectedUpdatedAt: new Date('2026-07-01T00:00:00Z')
      });
      expect(groupModel.update).toHaveBeenCalled();
    });

    // The stored active id has to stay resolvable when only the list is replaced.
    it('should reject a list that drops the currently active template', async () => {
      groupModel.findFirst.mockResolvedValueOnce({
        activeAssignmentEmailTemplateId: 'tpl-1',
        settings: {},
        updatedAt: new Date('2026-07-01T00:00:00Z')
      });
      await expect(
        groupsService.updateById('123', {
          emailTemplates: [template('tpl-2', 'Two')],
          expectedUpdatedAt: new Date('2026-07-01T00:00:00Z')
        })
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    // `emailTemplates` is replaced wholesale from the client's cached copy, so a concurrent edit
    // has to be rejected rather than silently overwritten.
    it('should reject an update composed against a stale revision', async () => {
      groupModel.findFirst.mockResolvedValueOnce({ settings: {}, updatedAt: new Date('2026-07-02T00:00:00Z') });
      await expect(
        groupsService.updateById('123', {
          emailTemplates: [],
          expectedUpdatedAt: new Date('2026-07-01T00:00:00Z')
        })
      ).rejects.toBeInstanceOf(ConflictException);
      expect(groupModel.update).not.toHaveBeenCalled();
    });

    // The pre-check is a separate read, so the revision has to constrain the write itself too.
    it('should carry the expected revision into the update where clause', async () => {
      const expectedUpdatedAt = new Date('2026-07-01T00:00:00Z');
      groupModel.findFirst.mockResolvedValueOnce({ settings: {}, updatedAt: expectedUpdatedAt });
      await groupsService.updateById('123', { emailTemplates: [], expectedUpdatedAt });
      expect(groupModel.update.mock.lastCall?.[0]).toMatchObject({ where: { updatedAt: expectedUpdatedAt } });
    });

    // The pre-check can pass and the conditional write still lose, when another writer commits
    // in between. Prisma reports that as P2025, which has to read as a conflict rather than a 500.
    it('should map a lost conditional write to a conflict', async () => {
      const expectedUpdatedAt = new Date('2026-07-01T00:00:00Z');
      groupModel.findFirst.mockResolvedValueOnce({ settings: {}, updatedAt: expectedUpdatedAt });
      groupModel.update.mockRejectedValueOnce(
        new PrismaClientKnownRequestError('No record was found for an update', {
          clientVersion: '6.19.3',
          code: 'P2025'
        })
      );
      await expect(groupsService.updateById('123', { emailTemplates: [], expectedUpdatedAt })).rejects.toBeInstanceOf(
        ConflictException
      );
    });

    it('should not disguise an unrelated database error as a conflict', async () => {
      const expectedUpdatedAt = new Date('2026-07-01T00:00:00Z');
      groupModel.findFirst.mockResolvedValueOnce({ settings: {}, updatedAt: expectedUpdatedAt });
      groupModel.update.mockRejectedValueOnce(new Error('connection lost'));
      await expect(groupsService.updateById('123', { emailTemplates: [], expectedUpdatedAt })).rejects.toThrow(
        'connection lost'
      );
    });

    it('should leave the where clause unconstrained when no revision is supplied', async () => {
      groupModel.findFirst.mockResolvedValueOnce({ settings: {} });
      await groupsService.updateById('123', { name: 'Test Group' });
      expect(groupModel.update.mock.lastCall?.[0].where).not.toHaveProperty('updatedAt');
    });

    it('should throw a ConflictException when renaming to an existing name', async () => {
      groupModel.findFirst.mockResolvedValueOnce({ name: 'Old Name', settings: {} });
      groupModel.exists.mockResolvedValueOnce(true);
      await expect(groupsService.updateById('123', { name: 'Taken Name' })).rejects.toBeInstanceOf(ConflictException);
      expect(groupModel.exists).toHaveBeenCalledWith({ name: 'Taken Name' });
    });
  });

  describe('findAll', () => {
    it('should return the array returned by the group model', async () => {
      groupModel.findMany.mockResolvedValueOnce([{ name: 'Test Group' }]);
      await expect(groupsService.findAll()).resolves.toMatchObject([{ name: 'Test Group' }]);
    });
  });

  describe('findById', () => {
    it('should throw a `NotFoundException` if there is no group with the provided id', async () => {
      groupModel.findFirst.mockResolvedValueOnce(null);
      await expect(groupsService.findById('123')).rejects.toBeInstanceOf(NotFoundException);
    });
    it('should return the group with the provided id if it exists', async () => {
      groupModel.findFirst.mockResolvedValueOnce({ name: 'Test Group' });
      await expect(groupsService.findById('123')).resolves.toMatchObject({ name: 'Test Group' });
    });
  });
});
