import type { EntityService } from '@douglasneuroinformatics/nestjs/core';
import { CryptoService } from '@douglasneuroinformatics/nestjs/modules';
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { type User } from '@open-data-capture/common/user';

import { accessibleQuery } from '@/ability/ability.utils';
import type { EntityOperationOptions } from '@/core/types';
import { GroupsService } from '@/groups/groups.service';
import { InjectModel } from '@/prisma/prisma.decorators';
import type { Model } from '@/prisma/prisma.types';

import { CreateUserDto } from './dto/create-user.dto';

import type { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService implements EntityService<User> {
  constructor(
    @InjectModel('User') private readonly userModel: Model<'User'>,
    private readonly cryptoService: CryptoService,
    private readonly groupsService: GroupsService
  ) {}

  async count(
    filter: NonNullable<Parameters<Model<'User'>['count']>[0]>['where'] = {},
    { ability }: EntityOperationOptions = {}
  ) {
    return this.userModel.count({
      where: { AND: [accessibleQuery(ability, 'read', 'User'), filter] }
    });
  }

  /** Adds a new user to the database with default permissions, verifying the provided groups exist */
  async create({ groupNames, password, username, ...rest }: CreateUserDto, options?: EntityOperationOptions) {
    if (await this.userModel.exists({ username })) {
      throw new ConflictException(`User with username '${username}' already exists!`);
    }

    const groupIds: string[] = [];
    for (const groupName of groupNames ?? []) {
      const group = await this.groupsService.findByName(groupName, options);
      groupIds.push(group.id);
    }

    const hashedPassword = await this.cryptoService.hashPassword(password);

    return this.userModel.create({
      data: {
        groupIds,
        password: hashedPassword,
        username: username,
        ...rest
      }
    });
  }

  async deleteById(id: string, { ability }: EntityOperationOptions = {}) {
    return this.userModel.delete({
      where: { AND: [accessibleQuery(ability, 'delete', 'User')], id }
    });
  }

  /** Delete the user with the provided username, otherwise throws */
  async deleteByUsername(username: string, { ability }: EntityOperationOptions = {}) {
    const user = await this.findByUsername(username);
    return this.userModel.delete({
      where: { AND: [accessibleQuery(ability, 'delete', 'User')], id: user.id }
    });
  }

  async findAll({ ability }: EntityOperationOptions = {}) {
    return this.userModel.findMany({
      where: accessibleQuery(ability, 'read', 'User')
    });
  }

  async findByGroup(groupName: string, { ability }: EntityOperationOptions = {}) {
    const group = await this.groupsService.findByName(groupName);
    return this.userModel.findMany({
      where: { AND: [accessibleQuery(ability, 'read', 'User'), { groupIds: { has: group.id } }] }
    });
  }

  async findById(id: string, { ability }: EntityOperationOptions = {}) {
    const user = await this.userModel.findFirst({
      where: { AND: [accessibleQuery(ability, 'read', 'User')], id }
    });
    if (!user) {
      throw new NotFoundException(`Failed to find user with ID: ${id}`);
    }
    return user;
  }

  async findByUsername(username: string, { ability }: EntityOperationOptions = {}) {
    const user = await this.userModel.findFirst({
      include: { groups: true },
      where: { AND: [accessibleQuery(ability, 'read', 'User'), { username }] }
    });
    if (!user) {
      throw new NotFoundException(`Failed to find user with username: ${username}`);
    }
    return user;
  }

  async updateById(id: string, data: UpdateUserDto, { ability }: EntityOperationOptions = {}) {
    return this.userModel.update({
      data,
      where: { AND: [accessibleQuery(ability, 'update', 'User')], id }
    });
  }
}
