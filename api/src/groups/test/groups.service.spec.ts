import assert from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';

import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';

import { GroupEntity } from '../entities/group.entity.js';

import { createMock } from '@/core/testing/create-mock.js';
import { GroupsService } from '@/groups/groups.service.js';

class MockGroupModel {
  exists() {}
  create() {}
}

describe('GroupsService', () => {
  let groupsService: GroupsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: GroupsService,
          useValue: createMock<GroupsService>()
        },
        {
          provide: getModelToken(GroupEntity.modelName),
          useValue: new MockGroupModel()
        }
      ]
    }).compile();

    groupsService = module.get<GroupsService>(GroupsService);
  });

  it('should be defined', () => {
    assert(groupsService);
  });
});
