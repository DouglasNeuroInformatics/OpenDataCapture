import { ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';

import bcrypt from 'bcrypt';

import { CreateUserDto } from './dto/create-user.dto';
import { User } from './schemas/user.schema';
import { UsersRepository } from './users.repository';

import { GroupsService } from '@/groups/groups.service';
import { Group } from '@/groups/schemas/group.schema';
import { PermissionsFactory } from '@/permissions/permissions.factory';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private readonly groupsService: GroupsService,
    private readonly permissionsFactory: PermissionsFactory,
    private readonly usersRepository: UsersRepository
  ) {}

  /** Adds a new user to the database with default permissions, verifying the provided groups exist */
  async create({ username, password, role, groupNames }: CreateUserDto): Promise<User> {
    this.logger.verbose(`Attempting to create user: ${username}`);

    const userExists = await this.usersRepository.exists({ username: username });
    if (userExists) {
      throw new ConflictException(`User with username '${username}' already exists!`);
    }

    const groups: Group[] = [];
    for (let i = 0; i < (groupNames?.length ?? 0); i++) {
      groups.push(await this.groupsService.findByName(groupNames![i]));
    }

    const permissions = this.permissionsFactory.createForUser({ username, role });
    const hashedPassword = await this.hashPassword(password);

    return this.usersRepository.create({
      username: username,
      password: hashedPassword,
      groups: groups,
      permissions: permissions.rules
    });
  }

  /** Returns an array of all users */
  async findAll(): Promise<User[]> {
    return this.usersRepository.find().exec();
  }

  /** Returns user with provided username if found, otherwise throws */
  async findByUsername(username: string): Promise<User> {
    const user = await this.usersRepository.findOne({ filter: { username } });
    if (!user) {
      throw new NotFoundException(`Failed to find user with username: ${username}`);
    }
    return user;
  }

  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, await bcrypt.genSalt());
  }
}
