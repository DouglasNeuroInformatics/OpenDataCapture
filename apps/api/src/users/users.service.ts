import { type AccessibleModel } from '@casl/mongoose';
import { CryptoService } from '@douglasneuroinformatics/nestjs/modules';
import { ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { type  AppAbility } from '@open-data-capture/types';
import { Model } from 'mongoose';

import { GroupEntity } from '@/groups/entities/group.entity';
import { GroupsService } from '@/groups/groups.service';

import { CreateUserDto } from './dto/create-user.dto';
import { type UserDocument, UserEntity } from './entities/user.entity';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectModel(UserEntity.modelName) private readonly userModel: Model<UserDocument, AccessibleModel<UserDocument>>,
    private readonly cryptoService: CryptoService,
    private readonly groupsService: GroupsService
  ) {}

  /** Adds a new user to the database with default permissions, verifying the provided groups exist */
  async create(createUserDto: CreateUserDto, ability: AppAbility): Promise<UserDocument> {
    const { basePermissionLevel, groupNames, password, username, ...rest } = createUserDto;
    this.logger.verbose(`Attempting to create user: ${username}`);

    const userExists = await this.userModel.exists({ username });
    if (userExists) {
      throw new ConflictException(`User with username '${username}' already exists!`);
    }

    const groups: GroupEntity[] = [];
    for (let i = 0; i < (groupNames?.length ?? 0); i++) {
      groups.push(await this.groupsService.findByName(groupNames![i]!, ability));
    }

    const hashedPassword = await this.cryptoService.hashPassword(password);

    return this.userModel.create({
      basePermissionLevel: basePermissionLevel,
      groups: groups,
      password: hashedPassword,
      username: username,
      ...rest
    });
  }

  /** Delete the user with the provided username, otherwise throws */
  async deleteByUsername(username: string): Promise<UserDocument> {
    const deletedUser = await this.userModel.findOneAndDelete({ username });
    if (!deletedUser) {
      throw new NotFoundException(`Failed to find user with username: ${username}`);
    }
    return deletedUser;
  }

  /** Returns an array of all users */
  async findAll(ability: AppAbility, groupName?: string): Promise<UserDocument[]> {
    const filter = groupName ? { groups: await this.groupsService.findByName(groupName, ability) } : {};
    return this.userModel.find(filter).accessibleBy(ability);
  }

  /** Returns user with provided username if found, otherwise throws */
  async findByUsername(username: string): Promise<UserDocument> {
    const user = await this.userModel.findOne({ username });
    if (!user) {
      throw new NotFoundException(`Failed to find user with username: ${username}`);
    }
    return user;
  }
}
