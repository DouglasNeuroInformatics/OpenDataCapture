import type { Model } from '@douglasneuroinformatics/libnest';
import { getModelToken } from '@douglasneuroinformatics/libnest';
import { MockFactory } from '@douglasneuroinformatics/libnest/testing';
import type { MockedInstance } from '@douglasneuroinformatics/libnest/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { GroupsService } from '../groups.service';

describe('GroupsService', () => {
  let groupsService: GroupsService;
  let groupModel: MockedInstance<Model<'Group'>>;
  let instrumentModel: MockedInstance<Model<'Instrument'>>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        GroupsService,
        MockFactory.createForModelToken(getModelToken('Group')),
        MockFactory.createForModelToken(getModelToken('Instrument'))
      ]
    }).compile();
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

    it('should connect only non-repo instruments (sourceRepoId: null)', async () => {
      instrumentModel.findMany.mockResolvedValueOnce([{ id: 'manual-1' }, { id: 'manual-2' }]);
      await groupsService.create({ name: 'Test Group', type: 'CLINICAL' });
      expect(instrumentModel.findMany).toHaveBeenCalledWith({ where: { sourceRepoId: null } });
      expect(groupModel.create.mock.lastCall?.[0]).toMatchObject({
        data: { accessibleInstruments: { connect: [{ id: 'manual-1' }, { id: 'manual-2' }] } }
      });
    });

    it('should throw a ConflictException if a group with the same name already exists in the db', async () => {
      groupModel.exists.mockResolvedValueOnce(true);
      await expect(groupsService.create({ name: 'Test Group', type: 'CLINICAL' })).rejects.toBeInstanceOf(
        ConflictException
      );
    });
  });

  describe('updateById', () => {
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
        where: { id: { in: ['live-1', 'deleted', 'live-2'] } }
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
