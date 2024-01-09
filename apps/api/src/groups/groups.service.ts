import { EntityService } from '@douglasneuroinformatics/nestjs/core';
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import type { Group } from '@open-data-capture/common/group';

import { accessibleQuery } from '@/ability/ability.utils';
import type { EntityOperationOptions } from '@/core/types';
import { InjectModel } from '@/prisma/prisma.decorators';
import type { Model } from '@/prisma/prisma.types';

import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';

@Injectable()
export class GroupsService implements EntityService<Group> {
  constructor(@InjectModel('Group') private readonly groupModel: Model<'Group'>) {}

  async create(group: CreateGroupDto) {
    const exists = await this.groupModel.exists({ name: group.name });
    if (exists) {
      throw new ConflictException(`Group with name '${group.name}' already exists!`);
    }
    return this.groupModel.create({ data: group });
  }

  async deleteById(id: string, { ability }: EntityOperationOptions = {}) {
    return this.groupModel.delete({
      where: { AND: [accessibleQuery(ability, 'delete', 'Group')], id }
    });
  }

  async findAll({ ability }: EntityOperationOptions = {}) {
    return this.groupModel.findMany({
      where: accessibleQuery(ability, 'read', 'Group')
    });
  }

  async findById(id: string, { ability }: EntityOperationOptions = {}) {
    const group = await this.groupModel.findFirst({
      where: { AND: [accessibleQuery(ability, 'read', 'Group')], id }
    });
    if (!group) {
      throw new NotFoundException(`Failed to find group with ID: ${id}`);
    }
    return group;
  }

  async updateById(id: string, data: UpdateGroupDto, { ability }: EntityOperationOptions = {}) {
    return this.groupModel.update({
      data,
      where: { AND: [accessibleQuery(ability, 'update', 'Group')], id }
    });
  }
}
