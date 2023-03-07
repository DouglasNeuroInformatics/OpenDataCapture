import { ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';

import bcrypt from 'bcrypt';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './schemas/user.schema';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private readonly usersRepository: UsersRepository) {}

  /** Creates a new user with hashed password, throws if username already exists. */
  async create(createUserDto: CreateUserDto): Promise<User> {
    const user: User = createUserDto;
    if (await this.usersRepository.exists({ username: user.username })) {
      throw new ConflictException(`User with username '${user.username}' already exists!`);
    }
    user.password = await this.hashPassword(user.password);
    return this.usersRepository.create(user);
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

  async updateByUsername(username: string, updateUserDto: UpdateUserDto): Promise<User> {
    const updatedUser = await this.usersRepository.findOneAndUpdate({ username }, updateUserDto);
    if (!updatedUser) {
      throw new NotFoundException(`Failed to find user with username: ${username}`);
    }
    return updatedUser;
  }

  /** Deletes the user with provided username if found, otherwise throws */
  async deleteByUsername(username: string): Promise<User> {
    const deletedUser = await this.usersRepository.findOneAndDelete({ username });
    console.log(deletedUser);
    if (!deletedUser) {
      throw new NotFoundException(`Failed to find user with username: ${username}`);
    }
    return deletedUser;
  }

  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, await bcrypt.genSalt());
  }
}
