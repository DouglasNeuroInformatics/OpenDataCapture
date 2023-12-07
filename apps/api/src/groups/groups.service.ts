import { accessibleBy } from '@casl/prisma';
import { EntityService } from '@douglasneuroinformatics/nestjs/core';
import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import type { Group } from '@open-data-capture/common/group';

import type { EntityOperationOptions } from '@/core/types';
import { InjectModel } from '@/prisma/prisma.decorators';
import type { Model } from '@/prisma/prisma.types';

import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';

@Injectable()
export class GroupsService implements EntityService<Group> {
  constructor(@InjectModel('Group') private readonly groupModel: Model<'Group'>) {}

  async create(group: CreateGroupDto) {
    const exists = (await this.groupModel.findFirst({ where: { name: group.name } })) !== null;
    if (exists) {
      throw new ConflictException(`Group with name '${group.name}' already exists!`);
    }
    return this.groupModel.create({ data: group });
  }

  async deleteById(id: string, { ability }: EntityOperationOptions = {}) {
    return this.groupModel.delete({
      where: { AND: [ability ? accessibleBy(ability, 'delete').GroupModel : {}], id }
    });
  }

  async findAll({ ability }: EntityOperationOptions = {}) {
    return this.groupModel.findMany({
      where: ability ? accessibleBy(ability, 'read').GroupModel : undefined
    });
  }

  async findById(id: string, { ability }: EntityOperationOptions = {}) {
    const group = await this.groupModel.findFirst({
      where: { AND: [ability ? accessibleBy(ability, '').GroupModel : {}], id }
    });
    if (!group) {
      throw new NotFoundException(`Failed to find group with ID: ${id}`);
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
