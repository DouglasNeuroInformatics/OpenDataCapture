import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';

import bcrypt from 'bcrypt';

import { User } from './schemas/user.schema';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async create(user: User): Promise<User> {
    if (await this.usersRepository.exists({ username: user.username })) {
      throw new ConflictException(`User with username '${user.username}' already exists!`);
    }
    user.password = await this.hashPassword(user.password);
    return this.usersRepository.create(user);
  }

  findAll(): Promise<User[]> {
    return this.usersRepository.findAll();
  }

  async findUser(username: string): Promise<User> {
    const user = await this.usersRepository.findOne({ username: username });
    if (!user) {
      throw new NotFoundException();
    }
    return user;
  }

  async updateUser(username: string, dto: Partial<User>): Promise<User> {
    const updatedUser = await this.usersRepository.updateUser(username, dto);
    if (!updatedUser) {
      throw new NotFoundException();
    }
    return updatedUser;
  }

  async removeUser(username: string): Promise<void> {
    const deletedUser = await this.usersRepository.removeUser(username);
    if (!deletedUser) {
      throw new NotFoundException();
    }
  }

  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, await bcrypt.genSalt());
  }
}
