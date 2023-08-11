import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { AccessibleModel } from '@casl/mongoose';
import { AppAbility, Group } from '@ddcp/types';
import { Model } from 'mongoose';

import { CreateGroupDto } from './dto/create-group.dto.js';
import { GroupDocument, GroupEntity } from './entities/group.entity.js';
import { UpdateGroupDto } from './entities/update-group.dto.js';

@Injectable()
export class GroupsService {
  constructor(
    @InjectModel(GroupEntity.modelName)
    private readonly groupModel: Model<GroupDocument, AccessibleModel<GroupDocument>>
  ) {}

  async create(createGroupDto: CreateGroupDto): Promise<Group> {
    if (await this.groupModel.exists({ name: createGroupDto.name })) {
      throw new ConflictException(`Group with name '${createGroupDto.name}' already exists!`);
    }
    return this.groupModel.create(createGroupDto);
  }

  async findAll(ability: AppAbility): Promise<Group[]> {
    return this.groupModel.find().accessibleBy(ability);
  }

  async findById(id: string, ability: AppAbility): Promise<Group> {
    const group = await this.groupModel.findById(id);
    if (!group) {
      throw new NotFoundException(`Failed to find group with id: ${id}`);
    }
    if (!ability.can('read', group)) {
      throw new ForbiddenException();
    }
    return group;
  }

  async findByName(name: string, ability: AppAbility): Promise<Group> {
    const group = await this.groupModel.findOne({ name }).exec();
    if (!group) {
      throw new NotFoundException(`Failed to find group with name: ${name}`);
    }
    if (!ability.can('read', group)) {
      throw new ForbiddenException();
    }
    return group;
  }

  async update(name: string, updateGroupDto: UpdateGroupDto): Promise<Group> {
    const result = await this.groupModel.findOneAndUpdate({ name }, updateGroupDto);
    if (!result) {
      throw new NotFoundException(`Failed to find group with name: ${name}`);
    }
    return result;
  }

  async remove(name: string): Promise<Group> {
    const result = await this.groupModel.findOneAndDelete({ name });
    if (!result) {
      throw new NotFoundException(`Failed to find group with name: ${name}`);
    }
    return result;
  }
}
