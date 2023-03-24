import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';

import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { GroupEntity } from './entities/group.entity';
import { GroupsRepository } from './groups.repository';

@Injectable()
export class GroupsService {
  constructor(private readonly groupsRepository: GroupsRepository) {}

  async create(createGroupDto: CreateGroupDto): Promise<GroupEntity> {
    if (await this.groupsRepository.exists({ name: createGroupDto.name })) {
      throw new ConflictException(`Group with name '${createGroupDto.name}' already exists!`);
    }
    return this.groupsRepository.create(createGroupDto);
  }

  async findAll(): Promise<GroupEntity[]> {
    return this.groupsRepository.find().exec();
  }

  async findByName(name: string): Promise<GroupEntity> {
    const group = await this.groupsRepository.findOne({ filter: { name } }).exec();
    if (!group) {
      throw new NotFoundException(`Failed to find group with name: ${name}`);
    }
    return group;
  }

  /*


  update(id: number, updateGroupDto: UpdateGroupDto) {
    return `This action updates a #${id} group`;
  }

  remove(id: number) {
    return `This action removes a #${id} group`;
  }
  */
}
