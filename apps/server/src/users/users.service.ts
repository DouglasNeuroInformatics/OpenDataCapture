import { ConflictException, ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';

import { AppAbility } from '@ddcp/common';

import { CreateUserDto } from './dto/create-user.dto';
import { UserEntity } from './entities/user.entity';
import { UsersRepository } from './users.repository';

import { CryptoService } from '@/crypto/crypto.service';
import { GroupEntity } from '@/groups/entities/group.entity';
import { GroupsService } from '@/groups/groups.service';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private readonly cryptoService: CryptoService,
    private readonly groupsService: GroupsService,
    private readonly usersRepository: UsersRepository
  ) {}

  /** Adds a new user to the database with default permissions, verifying the provided groups exist */
  async create(createUserDto: CreateUserDto, ability: AppAbility): Promise<UserEntity> {
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
      ...rest
    });
  }

  /** Returns an array of all users */
  async findAll(ability: AppAbility): Promise<UserEntity[]> {
    return this.usersRepository.find().accessibleBy(ability).lean();
  }

  /** Returns user with provided username if found, otherwise throws */
  async findByUsername(username: string): Promise<UserEntity> {
    const user = await this.usersRepository.findOne({ username });
    if (!user) {
      throw new NotFoundException(`Failed to find user with username: ${username}`);
    }
    return user;
  }
}
