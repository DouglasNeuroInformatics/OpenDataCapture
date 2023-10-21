// import { ConflictException, NotFoundException } from '@nestjs/common';
import { beforeEach, describe, expect, it } from 'bun:test';

import { type MockedInstance, createMock } from '@douglasneuroinformatics/nestjs/testing';
import { Test } from '@nestjs/testing';

import { GroupsRepository } from '../groups.repository';
import { GroupsService } from '../groups.service';

describe('GroupsService', () => {
  let groupsService: GroupsService;
  let groupsRepository: MockedInstance<GroupsRepository>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        GroupsService,
        {
          provide: GroupsRepository,
          useValue: createMock(GroupsRepository)
        }
      ]
    }).compile();
    groupsRepository = moduleRef.get(GroupsRepository);
    groupsService = moduleRef.get(GroupsService);
  });

  it('should be defined', () => {
    expect(groupsRepository).toBeDefined();
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
