import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';

import bcrypt from 'bcrypt';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './schemas/user.schema';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
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

  /** Returns user with provided username or throws */
  async findByUsername(username: string): Promise<User> {
    const user = await this.usersRepository.findOne({ filter: { username } });
    if (!user) {
      throw new NotFoundException(`Failed to find user with username: ${username}`);
    }
    return user;
  }

  update(id: number, updateUserDto: UpdateUserDto): any {
    return `This action updates a #${id} user`;
  }

  remove(id: number): any {
    return `This action removes a #${id} user`;
  }

  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, await bcrypt.genSalt());
  }
}
