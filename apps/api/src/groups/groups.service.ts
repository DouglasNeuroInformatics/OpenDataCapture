import { accessibleBy } from '@casl/mongoose';
import { EntityService } from '@douglasneuroinformatics/nestjs/core';
import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import type { Group } from '@open-data-capture/common/group';

import type { EntityOperationOptions } from '@/core/types';
import { PrismaService } from '@/prisma/prisma.service';

import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';

@Injectable()
export class GroupsService implements EntityService<Group> {
  constructor(private db: PrismaService) {}

  async create(group: CreateGroupDto) {
    const exists = (await this.db.group.findFirst({ where: { name: group.name } })) !== null;
    if (exists) {
      throw new ConflictException(`Group with name '${group.name}' already exists!`);
    }
    return this.db.group.create({ data: group });
  }

  async deleteById(id: string, { ability }: EntityOperationOptions = {}) {
    const group = await this.db.group.delete({ where: { id } });
    if (!group) {
      throw new NotFoundException(`Failed to find group with ID: ${id}`);
    } else if (ability && !ability.can('delete', group)) {
      throw new ForbiddenException(`Insufficient rights to delete group with ID: ${id}`);
    }
    return (await this.groupsRepository.deleteById(id))!;
  }

  async findAll({ ability }: EntityOperationOptions = {}) {
    if (!ability) {
      return this.groupsRepository.find();
    }
    return this.groupsRepository.find(accessibleBy(ability, 'read').Group);
  }

  async findById(id: string, { ability }: EntityOperationOptions = {}) {
    const group = await this.groupsRepository.findById(id);
    if (!group) {
      throw new NotFoundException(`Failed to find group with ID: ${id}`);
    } else if (ability && !ability.can('read', group)) {
      throw new ForbiddenException(`Insufficient rights to read group with ID: ${id}`);
    }
    return group;
  }

  async findByName(name: string, { ability }: EntityOperationOptions = {}) {
    const group = await this.groupsRepository.findOne({ name });
    if (!group) {
      throw new NotFoundException(`Failed to find group with name: ${name}`);
    } else if (ability && !ability.can('read', group)) {
      throw new ForbiddenException(`Insufficient rights to read group with name: ${name}`);
    }
    return group;
  }

  async updateById(id: string, update: UpdateGroupDto, { ability }: EntityOperationOptions = {}) {
    const group = await this.groupsRepository.findById(id);
    if (!group) {
      throw new NotFoundException(`Failed to find group with ID: ${id}`);
    } else if (ability && !ability.can('update', group)) {
      throw new ForbiddenException(`Insufficient rights to update group with ID: ${id}`);
    }
    return (await this.groupsRepository.updateById(id, update))!;
  }
}
