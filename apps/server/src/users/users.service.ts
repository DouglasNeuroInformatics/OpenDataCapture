import { ConflictException, Injectable } from '@nestjs/common';

import bcrypt from 'bcrypt';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './schemas/user.schema';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user: User = createUserDto;
    if (await this.usersRepository.exists({ username: user.username })) {
      throw new ConflictException(`User with username '${user.username}' already exists!`);
    }
    user.password = await this.hashPassword(user.password);
    return this.usersRepository.create(user);
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find().exec();
  }

  findOne(id: number): any {
    return `This action returns a #${id} user`;
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
