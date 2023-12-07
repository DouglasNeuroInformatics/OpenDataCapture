import { accessibleBy } from '@casl/prisma';
import { EntityService } from '@douglasneuroinformatics/nestjs/core';
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
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
      where: { AND: [ability ? accessibleBy(ability, 'read').GroupModel : {}], id }
    });
    if (!group) {
      throw new NotFoundException(`Failed to find group with ID: ${id}`);
    }
    return group;
  }

  async findByName(name: string, { ability }: EntityOperationOptions = {}) {
    const group = await this.groupModel.findFirst({
      where: { AND: [ability ? accessibleBy(ability, 'read').GroupModel : {}], name }
    });
    if (!group) {
      throw new NotFoundException(`Failed to find group with name: ${name}`);
    }
    return group;
  }

  async updateById(id: string, data: UpdateGroupDto, { ability }: EntityOperationOptions = {}) {
    return this.groupModel.update({
      data,
      where: { AND: [ability ? accessibleBy(ability, 'update').GroupModel : {}], id }
    });
  }
}
