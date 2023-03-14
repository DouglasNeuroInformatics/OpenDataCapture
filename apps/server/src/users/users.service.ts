import { ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';

import bcrypt from 'bcrypt';

import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { UserRole } from './enums/user-role.enum';
import { UsersRepository } from './users.repository';

import { GroupsService } from '@/groups/groups.service';
import { PermissionsFactory } from '@/permissions/permissions.factory';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private readonly groupsService: GroupsService,
    private readonly permissionsFactory: PermissionsFactory,
    private readonly usersRepository: UsersRepository
  ) {}

  async create({ role, username, password }: CreateUserDto): Promise<User> {
    this.logger.verbose(`Attempting to create user: ${username}`);
    const userExists = await this.usersRepository.exists({ username });
    if (userExists) {
      throw new ConflictException(`User with username '${username}' already exists!`);
    }

    const permissions = this.permissionsFactory.createForUser({ username, role });

    return this.usersRepository.create({
      username,
      password: await this.hashPassword(password),
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
