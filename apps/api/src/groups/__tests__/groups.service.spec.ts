import { MockFactory, type MockedInstance } from '@douglasneuroinformatics/libnest/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import type { Model } from '@/prisma/prisma.types';
import { getModelToken } from '@/prisma/prisma.utils';

import { GroupsService } from '../groups.service';

describe('GroupsService', () => {
  let groupsService: GroupsService;
  let groupModel: MockedInstance<Model<'Group'>>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [GroupsService, MockFactory.createForModelToken(getModelToken('Group'))]
    }).compile();
    groupModel = moduleRef.get(getModelToken('Group'));
    groupsService = moduleRef.get(GroupsService);
  });

  it('should be defined', () => {
    expect(groupModel).toBeDefined();
    expect(groupsService).toBeDefined();
  });

  describe('create', () => {
    it('should call the group model', async () => {
      await groupsService.create({ name: 'Test Group' });
      expect(groupModel.create.mock.lastCall?.[0]).toMatchObject({ data: { name: 'Test Group' } });
    });

    it('should throw a ConflictException if a group with the same name already exists in the db', async () => {
      groupModel.exists.mockResolvedValueOnce(true);
      await expect(groupsService.create({ name: 'Test Group' })).rejects.toBeInstanceOf(ConflictException);
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
