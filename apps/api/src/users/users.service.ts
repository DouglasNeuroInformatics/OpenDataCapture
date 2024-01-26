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
  async create(
    { basePermissionLevel, firstName, groupIds, lastName, password, username }: CreateUserDto,
    options?: EntityOperationOptions
  ) {
    if (await this.userModel.exists({ username })) {
      throw new ConflictException(`User with username '${username}' already exists!`);
    }

    // Check that all group exist and are accessible to the user
    for (const id of groupIds) {
      const group = await this.groupsService.findById(id, options);
      if (!group) {
        throw new NotFoundException(`Failed to resolve group with ID: ${id}`);
      }
    }

    const hashedPassword = await this.cryptoService.hashPassword(password);

    return this.userModel.create({
      data: {
        basePermissionLevel,
        firstName,
        groups: {
          connect: groupIds.map((id) => ({ id }))
        },
        lastName,
        password: hashedPassword,
        username: username
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

  async find({ groupId }: { groupId?: string } = {}, { ability }: EntityOperationOptions = {}) {
    return this.userModel.findMany({
      where: {
        AND: [accessibleQuery(ability, 'read', 'User'), { groupIds: { has: groupId } }]
      }
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
