import assert from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';

import { Test, TestingModule } from '@nestjs/testing';

import { GroupsController } from '../groups.controller';
import { GroupsService } from '../groups.service';

import { createMock } from '@/core/testing/create-mock';

describe('GroupsController', () => {
  let groupsController: GroupsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GroupsController],
      providers: [
        {
          provide: GroupsService,
          useValue: createMock<GroupsService>()
        }
      ]
    }).compile();

    groupsController = module.get(GroupsController);
  });

  it('should be defined', () => {
    assert(groupsController);
  });
});
