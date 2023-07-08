import { ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';

import { AppAbility } from '@douglasneuroinformatics/common';

import { CreateUserDto } from './dto/create-user.dto.js';
import { UserDocument } from './entities/user.entity.js';
import { UsersRepository } from './users.repository.js';

import { CryptoService } from '@/crypto/crypto.service.js';
import { GroupEntity } from '@/groups/entities/group.entity.js';
import { GroupsService } from '@/groups/groups.service.js';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private readonly cryptoService: CryptoService,
    private readonly groupsService: GroupsService,
    private readonly usersRepository: UsersRepository
  ) {}

  /** Adds a new user to the database with default permissions, verifying the provided groups exist */
  async create(createUserDto: CreateUserDto, ability: AppAbility): Promise<UserDocument> {
    const { username, password, basePermissionLevel, groupNames, ...rest } = createUserDto;
    this.logger.verbose(`Attempting to create user: ${username}`);

    const userExists = await this.usersRepository.exists({ username: username });
    if (userExists) {
      throw new ConflictException(`User with username '${username}' already exists!`);
    }

    const groups: GroupEntity[] = [];
    for (let i = 0; i < (groupNames?.length ?? 0); i++) {
      groups.push(await this.groupsService.findByName(groupNames![i], ability));
    }

    const hashedPassword = await this.cryptoService.hashPassword(password);

    return this.usersRepository.create({
      username: username,
      password: hashedPassword,
      groups: groups,
      basePermissionLevel: basePermissionLevel,
      sessions: [],
      ...rest
    });
  }

  /** Returns an array of all users */
  async findAll(ability: AppAbility, groupName?: string): Promise<UserDocument[]> {
    const filter = groupName ? { groups: await this.groupsService.findByName(groupName, ability) } : {};
    return this.usersRepository.find(filter).accessibleBy(ability);
  }

  /** Returns user with provided username if found, otherwise throws */
  async findByUsername(username: string): Promise<UserDocument> {
    const user = await this.usersRepository.findOne({ username });
    if (!user) {
      throw new NotFoundException(`Failed to find user with username: ${username}`);
    }
    return user;
  }

  /** Delete the user with the provided username, otherwise throws */
  async deleteByUsername(username: string): Promise<UserDocument> {
    const deletedUser = await this.usersRepository.findOneAndDelete({ username });
    if (!deletedUser) {
      throw new NotFoundException(`Failed to find user with username: ${username}`);
    }
    return deletedUser;
  }
}
