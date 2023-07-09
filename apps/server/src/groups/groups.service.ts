import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';

import { AppAbility, Group } from '@ddcp/types';

import { CreateGroupDto } from './dto/create-group.dto.js';
import { UpdateGroupDto } from './dto/update-group.dto.js';
import { GroupsRepository } from './groups.repository.js';

@Injectable()
export class GroupsService {
  constructor(private readonly groupsRepository: GroupsRepository) {}

  async create(createGroupDto: CreateGroupDto): Promise<Group> {
    if (await this.groupsRepository.exists({ name: createGroupDto.name })) {
      throw new ConflictException(`Group with name '${createGroupDto.name}' already exists!`);
    }
    return this.groupsRepository.create(createGroupDto);
  }

  async findAll(ability: AppAbility): Promise<Group[]> {
    return this.groupsRepository.find().accessibleBy(ability);
  }

  async findById(id: string, ability: AppAbility): Promise<Group> {
    const group = await this.groupsRepository.findById(id);
    if (!group) {
      throw new NotFoundException(`Failed to find group with id: ${id}`);
    }
    if (!ability.can('read', group)) {
      throw new ForbiddenException();
    }
    return group;
  }

  async findByName(name: string, ability: AppAbility): Promise<Group> {
    const group = await this.groupsRepository.findOne({ name }).exec();
    if (!group) {
      throw new NotFoundException(`Failed to find group with name: ${name}`);
    }
    if (!ability.can('read', group)) {
      throw new ForbiddenException();
    }
    return group;
  }

  async update(name: string, updateGroupDto: UpdateGroupDto): Promise<Group> {
    const result = await this.groupsRepository.findOneAndUpdate({ name }, updateGroupDto);
    if (!result) {
      throw new NotFoundException(`Failed to find group with name: ${name}`);
    }
    return result;
  }

  async remove(name: string): Promise<Group> {
    const result = await this.groupsRepository.findOneAndDelete({ name });
    if (!result) {
      throw new NotFoundException(`Failed to find group with name: ${name}`);
    }
    return result;
  }
}
