import { ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';

import { AppAbility } from '@douglasneuroinformatics/common';

import { CreateUserDto } from './dto/create-user.dto';
import { UserDocument } from './entities/user.entity';
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
    return this.usersRepository.find(filter).accessibleBy(ability).lean();
  }

  /** Returns user with provided username if found, otherwise throws */
  async findByUsername(username: string): Promise<UserDocument> {
    const user = await this.usersRepository.findOne({ username });
    if (!user) {
      throw new NotFoundException(`Failed to find user with username: ${username}`);
    }
    return user;
  }
}
