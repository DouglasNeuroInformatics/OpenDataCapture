import { CryptoService, InjectModel } from '@douglasneuroinformatics/libnest';
import type { Model } from '@douglasneuroinformatics/libnest';
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';

import { accessibleQuery } from '@/auth/ability.utils';
import type { EntityOperationOptions } from '@/core/types';
import { GroupsService } from '@/groups/groups.service';

import { CreateUserDto } from './dto/create-user.dto';

import type { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel('User') private readonly userModel: Model<'User'>,
    private readonly cryptoService: CryptoService,
    private readonly groupsService: GroupsService
  ) {}

  async checkUsernameExists(username: string, { ability }: EntityOperationOptions = {}): Promise<{ success: boolean }> {
    const user = await this.userModel.findFirst({
      include: { groups: true },
      omit: {
        hashedPassword: true
      },
      where: { AND: [accessibleQuery(ability, 'read', 'User'), { username }] }
    });
    if (!user) {
      return { success: false };
    }
    return { success: true };
  }

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
    { basePermissionLevel, dateOfBirth, firstName, groupIds, lastName, password, sex, username }: CreateUserDto,
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
        additionalPermissions: [],
        basePermissionLevel,
        dateOfBirth,
        firstName,
        groups: {
          connect: groupIds.map((id) => ({ id }))
        },
        hashedPassword,
        lastName,
        sex,
        username: username
      },
      omit: {
        hashedPassword: true
      }
    });
  }

  async deleteById(id: string, { ability }: EntityOperationOptions = {}) {
    return this.userModel.delete({
      omit: {
        hashedPassword: true
      },
      where: { AND: [accessibleQuery(ability, 'delete', 'User')], id }
    });
  }

  /** Delete the user with the provided username, otherwise throws */
  async deleteByUsername(username: string, { ability }: EntityOperationOptions = {}) {
    const user = await this.findByUsername(username);
    return this.userModel.delete({
      omit: {
        hashedPassword: true
      },
      where: { AND: [accessibleQuery(ability, 'delete', 'User')], id: user.id }
    });
  }

  async find({ groupId }: { groupId?: string } = {}, { ability }: EntityOperationOptions = {}) {
    return this.userModel.findMany({
      omit: {
        hashedPassword: true
      },
      where: {
        AND: [accessibleQuery(ability, 'read', 'User'), { groupIds: groupId ? { has: groupId } : undefined }]
      }
    });
  }

  async findById(id: string, { ability }: EntityOperationOptions = {}) {
    const user = await this.userModel.findFirst({
      omit: {
        hashedPassword: true
      },
      where: { AND: [accessibleQuery(ability, 'read', 'User')], id }
    });
    if (!user) {
      throw new NotFoundException(`Failed to find user with ID: ${id}`);
    }
    return user;
  }

  async findByUsername(
    username: string,
    { ability, includeHashedPassword }: EntityOperationOptions & { includeHashedPassword?: boolean } = {}
  ) {
    const user = await this.userModel.findFirst({
      include: { groups: true },
      omit: {
        hashedPassword: !includeHashedPassword
      },
      where: { AND: [accessibleQuery(ability, 'read', 'User'), { username }] }
    });
    if (!user) {
      throw new NotFoundException(`Failed to find user with username: ${username}`);
    }
    return user;
  }

  async updateById(
    id: string,
    { groupIds, password, ...data }: UpdateUserDto,
    { ability }: EntityOperationOptions = {}
  ) {
    let hashedPassword: string | undefined;
    if (password) {
      hashedPassword = await this.cryptoService.hashPassword(password);
    }
    return this.userModel.update({
      data: {
        ...data,
        groups: {
          connect: groupIds?.map((id) => ({ id }))
        },
        hashedPassword
      },
      omit: {
        hashedPassword: true
      },
      where: { AND: [accessibleQuery(ability, 'update', 'User')], id }
    });
  }
}
