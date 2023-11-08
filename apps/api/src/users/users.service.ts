import { accessibleBy } from '@casl/mongoose';
import type { EntityService } from '@douglasneuroinformatics/nestjs/core';
import { CryptoService } from '@douglasneuroinformatics/nestjs/modules';
import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { type User } from '@open-data-capture/common/user';
import type { FilterQuery } from 'mongoose';

import type { EntityOperationOptions } from '@/core/types';
import type { GroupEntity } from '@/groups/entities/group.entity';
import { GroupsService } from '@/groups/groups.service';

import { CreateUserDto } from './dto/create-user.dto';
import { UsersRepository } from './users.repository';

import type { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService implements EntityService<User> {
  constructor(
    private readonly cryptoService: CryptoService,
    private readonly groupsService: GroupsService,
    private readonly usersRepository: UsersRepository
  ) {}

  async count(filter: FilterQuery<User> = {}, { ability }: EntityOperationOptions = {}) {
    return this.usersRepository.count({ $and: [filter, ability ? accessibleBy(ability, 'read').User : {}] });
  }

  /** Adds a new user to the database with default permissions, verifying the provided groups exist */
  async create({ groupNames, password, username, ...rest }: CreateUserDto, options?: EntityOperationOptions) {
    if (await this.usersRepository.exists({ name: username })) {
      throw new ConflictException(`User with username '${username}' already exists!`);
    }

    const groups: GroupEntity[] = [];
    for (const groupName of groupNames ?? []) {
      const group = await this.groupsService.findByName(groupName, options);
      groups.push(group);
    }

    const hashedPassword = await this.cryptoService.hashPassword(password);

    return this.usersRepository.create({
      groups: groups,
      password: hashedPassword,
      username: username,
      ...rest
    });
  }

  async deleteById(id: string, { ability }: EntityOperationOptions = {}) {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`Failed to find user with ID: ${id}`);
    } else if (ability && !ability.can('delete', user)) {
      throw new ForbiddenException(`Insufficient rights to delete user with ID: ${id}`);
    }
    return (await this.usersRepository.deleteById(id))!;
  }

  /** Delete the user with the provided username, otherwise throws */
  async deleteByUsername(username: string, { ability }: EntityOperationOptions = {}) {
    const user = await this.usersRepository.findByUsername(username);
    if (!user) {
      throw new NotFoundException(`Failed to find user with username: ${username}`);
    } else if (ability && !ability.can('delete', user)) {
      throw new ForbiddenException(`Insufficient rights to delete user with username: ${username}`);
    }
    return (await this.usersRepository.deleteByUsername(username))!;
  }

  async findAll({ ability }: EntityOperationOptions = {}) {
    if (!ability) {
      return this.usersRepository.find();
    }
    return this.usersRepository.find(accessibleBy(ability, 'read').User);
  }

  async findByGroup(groupName: string, { ability }: EntityOperationOptions = {}) {
    const group = await this.groupsService.findByName(groupName);
    return this.usersRepository.find({
      $and: [{ groups: group }, ability ? accessibleBy(ability, 'read').User : {}]
    });
  }

  async findById(id: string, { ability }: EntityOperationOptions = {}) {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`Failed to find user with ID: ${id}`);
    } else if (ability && !ability.can('read', user)) {
      throw new ForbiddenException(`Insufficient rights to read user with ID: ${id}`);
    }
    return user;
  }

  async findByUsername(username: string, { ability }: EntityOperationOptions = {}) {
    const user = await this.usersRepository.findByUsername(username);
    if (!user) {
      throw new NotFoundException(`Failed to find user with username: ${username}`);
    } else if (ability && !ability.can('read', user)) {
      throw new ForbiddenException(`Insufficient rights to read user with username: ${username}`);
    }
    return user;
  }

  async updateById(id: string, update: UpdateUserDto, { ability }: EntityOperationOptions = {}) {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`Failed to find user with ID: ${id}`);
    } else if (ability && !ability.can('update', user)) {
      throw new ForbiddenException(`Insufficient rights to update user with ID: ${id}`);
    }
    return (await this.usersRepository.updateById(id, update))!;
  }
}
