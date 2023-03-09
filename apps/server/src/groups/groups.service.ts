import { ConflictException, Injectable } from '@nestjs/common';

import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { Group } from './entities/group.entity';
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

  findAll(): Promise<Group[]> {
    return this.groupsRepository.find().exec();
  }

  /*

  findOne(id: number) {
    return `This action returns a #${id} group`;
  }

  update(id: number, updateGroupDto: UpdateGroupDto) {
    return `This action updates a #${id} group`;
  }

  remove(id: number) {
    return `This action removes a #${id} group`;
  }
  */
}
