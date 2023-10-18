import { EntityService } from '@douglasneuroinformatics/nestjs/core';
import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import type { Group } from '@open-data-capture/types';

import { AbilityService } from '@/ability/ability.service';

import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { GroupsRepository } from './groups.repository';

@Injectable()
export class GroupsService extends EntityService<Group, { validateAbility?: boolean }> {
  constructor(
    private readonly abilityService: AbilityService,
    private readonly groupsRepository: GroupsRepository
  ) {
    super();
  }

  async create(group: CreateGroupDto) {
    if (await this.groupsRepository.exists({ name: group.name })) {
      throw new ConflictException(`Group with name '${group.name}' already exists!`);
    }
    return this.groupsRepository.create(group);
  }

  async deleteById(id: string, { validateAbility = true }) {
    const group = await this.groupsRepository.findById(id);
    if (!group) {
      throw new NotFoundException(`Failed to find group with ID: ${id}`);
    } else if (validateAbility && !this.abilityService.can('delete', group)) {
      throw new ForbiddenException(`Insufficient rights to delete group with ID: ${id}`);
    }
    return (await this.groupsRepository.deleteById(id))!;
  }

  async findAll({ validateAbility = true }) {
    if (!validateAbility) {
      return this.groupsRepository.find();
    }
    return this.groupsRepository.find(this.abilityService.accessibleQuery('read'));
  }

  async findById(id: string, { validateAbility = true }) {
    const group = await this.groupsRepository.findById(id);
    if (!group) {
      throw new NotFoundException(`Failed to find group with ID: ${id}`);
    } else if (validateAbility && !this.abilityService.can('delete', group)) {
      throw new ForbiddenException(`Insufficient rights to read group with ID: ${id}`);
    }
    return group;
  }

  async updateById(id: string, update: UpdateGroupDto, { validateAbility = true }) {
    const group = await this.groupsRepository.findById(id);
    if (!group) {
      throw new NotFoundException(`Failed to find group with ID: ${id}`);
    } else if (validateAbility && !this.abilityService.can('update', group)) {
      throw new ForbiddenException(`Insufficient rights to update group with ID: ${id}`);
    }
    return (await this.groupsRepository.updateById(id, update))!;
  }
}
