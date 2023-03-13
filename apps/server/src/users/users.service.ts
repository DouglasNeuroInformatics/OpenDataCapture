import { ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';

import bcrypt from 'bcrypt';

import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { UserKind } from './enums/user-kind.enum';
import { UsersRepository } from './users.repository';

import { GroupsService } from '@/groups/groups.service';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private readonly groupsService: GroupsService, private readonly usersRepository: UsersRepository) {}

  async create({ kind, username, password }: CreateUserDto): Promise<User> {
    this.logger.verbose(`Attempting to create user: ${username}`);
    const userExists = await this.usersRepository.exists({ username });
    if (userExists) {
      throw new ConflictException(`User with username '${username}' already exists!`);
    }

    return this.usersRepository.create({
      kind: kind || UserKind.Standard,
      username,
      password: await this.hashPassword(password)
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
