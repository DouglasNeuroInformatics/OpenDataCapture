import type { EntityService } from '@douglasneuroinformatics/nestjs/core';
import { CryptoService } from '@douglasneuroinformatics/nestjs/modules';
import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { type User } from '@open-data-capture/types';

import { AbilityService } from '@/ability/ability.service';
import type { GroupEntity } from '@/groups/entities/group.entity';
import { GroupsService } from '@/groups/groups.service';

import { CreateUserDto } from './dto/create-user.dto';
import { UsersRepository } from './users.repository';

import type { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService implements EntityService<User> {
  constructor(
    private readonly abilityService: AbilityService,
    private readonly cryptoService: CryptoService,
    private readonly groupsService: GroupsService,
    private readonly usersRepository: UsersRepository
  ) {}

  /** Adds a new user to the database with default permissions, verifying the provided groups exist */
  async create({ groupNames, password, username, ...rest }: CreateUserDto, { validateAbility = true } = {}) {
    if (await this.usersRepository.exists({ name: username })) {
      throw new ConflictException(`User with username '${username}' already exists!`);
    }

    const groups: GroupEntity[] = [];
    for (const groupName of groupNames ?? []) {
      const group = await this.groupsService.findByName(groupName, { validateAbility });
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

  async deleteById(id: string, { validateAbility = true } = {}) {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`Failed to find user with ID: ${id}`);
    } else if (validateAbility && !this.abilityService.can('delete', user)) {
      throw new ForbiddenException(`Insufficient rights to delete user with ID: ${id}`);
    }
    return (await this.usersRepository.deleteById(id))!;
  }

  /** Delete the user with the provided username, otherwise throws */
  async deleteByUsername(username: string, { validateAbility = true } = {}) {
    const user = await this.usersRepository.findByUsername(username);
    if (!user) {
      throw new NotFoundException(`Failed to find user with username: ${username}`);
    } else if (validateAbility && !this.abilityService.can('delete', user)) {
      throw new ForbiddenException(`Insufficient rights to delete user with username: ${username}`);
    }
    return (await this.usersRepository.deleteByUsername(username))!;
  }

  async findAll({ validateAbility = true } = {}) {
    if (!validateAbility) {
      return this.usersRepository.find();
    }
    return this.usersRepository.find(this.abilityService.accessibleQuery('read'));
  }

  async findByGroup(groupName: string, { validateAbility = true } = {}) {
    const groupQuery = { groups: { name: groupName } };
    if (!validateAbility) {
      return this.usersRepository.find(groupQuery);
    }
    return this.usersRepository.find(this.abilityService.accessibleQuery('read', groupQuery));
  }

  async findById(id: string, { validateAbility = true } = {}) {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`Failed to find user with ID: ${id}`);
    } else if (validateAbility && !this.abilityService.can('delete', user)) {
      throw new ForbiddenException(`Insufficient rights to read user with ID: ${id}`);
    }
    return user;
  }

  async findByUsername(username: string, { validateAbility = true } = {}) {
    const user = await this.usersRepository.findByUsername(username);
    if (!user) {
      throw new NotFoundException(`Failed to find user with username: ${username}`);
    } else if (validateAbility && !this.abilityService.can('delete', user)) {
      throw new ForbiddenException(`Insufficient rights to read user with username: ${username}`);
    }
    return user;
  }

  async updateById(id: string, update: UpdateUserDto, { validateAbility = true } = {}) {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`Failed to find user with ID: ${id}`);
    } else if (validateAbility && !this.abilityService.can('update', user)) {
      throw new ForbiddenException(`Insufficient rights to update user with ID: ${id}`);
    }
    return (await this.usersRepository.updateById(id, update))!;
  }
}
