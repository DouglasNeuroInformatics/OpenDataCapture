import assert from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';

import { ConflictException, NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';

import { GroupEntity } from '../entities/group.entity.js';

import { GroupsService } from '@/groups/groups.service.js';

const mockGroup = Object.freeze({
  name: 'Test Group'
});

class MockGroupModel {
  private readonly groups: GroupEntity[] = [];

  exists(group: { name: string }) {
    return Boolean(this.groups.find(({ name }) => name === group.name));
  }

  create(group: GroupEntity) {
    this.groups.push(group);
    return Promise.resolve(group);
  }

  findOneAndDelete(group: GroupEntity) {
    for (let i = 0; i < this.groups.length; i++) {
      if (this.groups[i].name === group.name) {
        return this.groups.splice(i)[0];
      }
    }
    return null;
  }

  findOneAndUpdate(group: GroupEntity, updateGroupDto: { name: string }) {
    for (let i = 0; i < this.groups.length; i++) {
      if (this.groups[i].name === group.name) {
        this.groups[i].name = updateGroupDto.name;
        return this.groups[i];
      }
    }
    return null;
  }
}

describe('GroupsService', () => {
  let groupsService: GroupsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GroupsService,
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

  describe('create', () => {
    it('should add a group to the database and return an object with the same group name', async () => {
      const group = await groupsService.create({ name: 'Test Group' });
      assert(group.name === mockGroup.name);
    });

    it('should throw a ConflictException if a group with the same name already exists in the db', async () => {
      await groupsService.create({ name: 'Test Group' });
      assert.rejects(() => groupsService.create({ name: 'Test Group' }), ConflictException);
    });
  });

  //   describe('findAll', () => {
  //     it('should return an array with all groups', async () => {
  //       const subject = await subjectsService.create({
  //         ...mockSubject,
  //         dateOfBirth: mockSubject.dateOfBirth.toISOString()
  //       });
  //       assert(subject.firstName === mockSubject.firstName && subject.lastName === mockSubject.lastName);
  //     });

  //     it('should throw a ConflictException if a subject with the same info already exists in the db', async () => {
  //     //   await subjectsService.create({ firstName: 'John', lastName: 'Smith', dateOfBirth: '2000-01-01', sex: 'male' });
  //     //   assert.rejects(
  //     //     () => subjectsService.create({ firstName: 'John', lastName: 'Smith', dateOfBirth: '2000-01-01', sex: 'male' }),
  //     //     ConflictException
  //     //   );
  //     });
  //   });

  //   describe('findById', () => {
  //     it('should add a subject to the database and return an object with the same first and last name', async () => {
  //     //   const subject = await subjectsService.create({
  //     //     ...mockSubject,
  //     //     dateOfBirth: mockSubject.dateOfBirth.toISOString()
  //     //   });
  //     //   assert(subject.firstName === mockSubject.firstName && subject.lastName === mockSubject.lastName);
  //     });

  //     it('should throw a ConflictException if a subject with the same info already exists in the db', async () => {
  //     //   await subjectsService.create({ firstName: 'John', lastName: 'Smith', dateOfBirth: '2000-01-01', sex: 'male' });
  //     //   assert.rejects(
  //     //     () => subjectsService.create({ firstName: 'John', lastName: 'Smith', dateOfBirth: '2000-01-01', sex: 'male' }),
  //     //     ConflictException
  //     //   );
  //     });
  //   });

  //   describe('findByName', () => {
  //     it('should add a subject to the database and return an object with the same first and last name', async () => {
  //     //   const subject = await subjectsService.create({
  //     //     ...mockSubject,
  //     //     dateOfBirth: mockSubject.dateOfBirth.toISOString()
  //     //   });
  //     //   assert(subject.firstName === mockSubject.firstName && subject.lastName === mockSubject.lastName);
  //     });

  //     it('should throw a ConflictException if a subject with the same info already exists in the db', async () => {
  //     //   await subjectsService.create({ firstName: 'John', lastName: 'Smith', dateOfBirth: '2000-01-01', sex: 'male' });
  //     //   assert.rejects(
  //     //     () => subjectsService.create({ firstName: 'John', lastName: 'Smith', dateOfBirth: '2000-01-01', sex: 'male' }),
  //     //     ConflictException
  //     //   );
  //     });
  //   });

  describe('update', () => {
    it('should find the group and update its group name in the db', async () => {
      await groupsService.create({ name: 'Test' });
      const result = await groupsService.update('Test', { name: 'New Group Name' });
      assert(result.name === 'New Group Name');
    });

    it('should throw a NotFoundException if a group name does not exist in the db', async () => {
      await groupsService.create({ name: 'Test Group' });
      assert.rejects(() => groupsService.update('Test1 Group', { name: 'New Group Name' }), NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove the group in the db', async () => {
      await groupsService.create({ name: 'Test' });
      const result = await groupsService.remove('Test');
      assert(result.name === 'Test');
    });

    it('should throw a NotFoundException if the group does not exist in the db', async () => {
      await groupsService.create({ name: 'Test' });
      assert.rejects(() => groupsService.remove('Test1'), NotFoundException);
    });
  });
});
