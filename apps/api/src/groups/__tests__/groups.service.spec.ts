// import { ConflictException, NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';

import { beforeEach, describe, expect, it } from 'bun:test';

import { GroupEntity } from '../entities/group.entity';
import { GroupsService } from '../groups.service';

describe('GroupsService', () => {
  let groupsService: GroupsService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        GroupsService,
        {
          provide: getModelToken(GroupEntity.modelName),
          useValue: {}
        }
      ]
    }).compile();
    groupsService = moduleRef.get(GroupsService);
  });

  it('should be defined', () => {
    expect(groupsService).toBeDefined();
  });

  // describe('create', () => {
  //   it('should call the group model', async () => {
  //     await groupsService.create({ name: 'Test Group' });
  //     expect(groupModel.create.mock.lastCall?.[0]).toMatchObject({ name: 'Test Group' });
  //   });

  //   it('should throw a ConflictException if a group with the same name already exists in the db', () => {
  //     groupModel.exists.mockResolvedValueOnce(true);
  //     expect(groupsService.create({ name: 'Test Group' })).rejects.toBeInstanceOf(ConflictException);
  //   });
  // });

  // describe('findAll', () => {
  //   it('should return the array returned by the group model', () => {
  //     groupModel.find.mockResolvedValueOnce([{ name: 'Test Group' }]);
  //     expect(groupsService.findAll()).resolves.toBeArrayOfSize(1);
  //   });
  // });

  // describe('findById', () => {
  //   it('should throw a `NotFoundException` if there is no group with the provided id', () => {
  //     groupModel.findById.mockResolvedValueOnce(null);
  //     expect(groupsService.findById(new Types.ObjectId())).rejects.toBeInstanceOf(NotFoundException);
  //   });
  //   it('should return the group with the provided id if it exists', () => {
  //     groupModel.findById.mockResolvedValueOnce({ name: 'Test Group' });
  //     expect(groupsService.findById(new Types.ObjectId())).resolves.toMatchObject({ name: 'Test Group' });
  //   });
  // });
});
