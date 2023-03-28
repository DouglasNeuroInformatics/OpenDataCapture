import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';

import { Group } from '@ddcp/common';

import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { GroupsRepository } from './groups.repository';

@Injectable()
export class GroupsService {
  constructor(private readonly groupsRepository: GroupsRepository) {}

  async create(createGroupDto: CreateGroupDto): Promise<Group> {
    if (await this.groupsRepository.exists({ name: createGroupDto.name })) {
      throw new ConflictException(`Group with name '${createGroupDto.name}' already exists!`);
    }
    return this.groupsRepository.create(createGroupDto);
  }

  async findAll(): Promise<Group[]> {
    return this.groupsRepository.find().exec();
  }

  async findOne(name: string): Promise<Group> {
    const group = await this.groupsRepository.findOne({ name }).exec();
    if (!group) {
      throw new NotFoundException(`Failed to find group with name: ${name}`);
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
