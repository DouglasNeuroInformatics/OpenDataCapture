import { MockFactory, type MockedInstance } from '@douglasneuroinformatics/nestjs/testing';
import { Test } from '@nestjs/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { GroupsController } from '../groups.controller';
import { GroupsService } from '../groups.service';

describe('GroupsController', () => {
  let groupsController: GroupsController;
  let groupsService: MockedInstance<GroupsService>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [GroupsController],
      providers: [MockFactory.createForService(GroupsService)]
    }).compile();
    groupsController = moduleRef.get(GroupsController);
    groupsService = moduleRef.get(GroupsService);
  });

  it('should be defined', () => {
    expect(groupsController).toBeDefined();
  });

  describe('create', () => {
    it('should pass the provided object to the groups service', async () => {
      await groupsController.create({ name: 'Test Group' });
      expect(groupsService.create.mock.lastCall?.[0]).toMatchObject({ name: 'Test Group' });
    });
  });

  describe('findAll', () => {
    it('should return the array returned by the groups service', async () => {
      groupsService.findAll.mockResolvedValueOnce([{ name: 'Test Group' }]);
      expect(groupsController.findAll()).resolves.toMatchObject([{ name: 'Test Group' }]);
    });
  });

  describe('findById', () => {
    it('should return the value provided by the groups service ', () => {
      groupsService.findById.mockResolvedValueOnce({ name: 'Test Group' });
      expect(groupsService.findById('123')).resolves.toMatchObject({
        name: 'Test Group'
      });
    });
  });
});
