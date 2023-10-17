import type { EntityService } from '@douglasneuroinformatics/nestjs/core';
import { ConflictException, Injectable } from '@nestjs/common';
import type { Group } from '@open-data-capture/types';

import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { GroupsRepository } from './groups.repository';

@Injectable()
export class GroupsService implements EntityService<Group> {
  constructor(private readonly groupsRepository: GroupsRepository) {}

  async create(group: CreateGroupDto) {
    if (await this.groupsRepository.exists({ name: group.name })) {
      throw new ConflictException(`Group with name '${group.name}' already exists!`);
    }
    return this.groupsRepository.create(group);
  }

  async deleteById(id: string) {
    return this.groupsRepository.deleteById(id);
  }

  async findAll() {
    return this.groupsRepository.find();
  }

  async findById(id: string) {
    return this.groupsRepository.findById(id);
  }

  async updateById(id: string, update: UpdateGroupDto) {
    return this.groupsRepository.updateById(id, update);
  }
}
