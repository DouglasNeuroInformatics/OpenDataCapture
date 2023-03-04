import { Injectable } from '@nestjs/common';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  create(createUserDto: CreateUserDto): any {
    return 'This action adds a new user';
  }

  findAll(): any {
    return `This action returns all users`;
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
}
