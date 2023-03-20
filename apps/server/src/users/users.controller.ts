import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { CreateUserDto } from './dto/create-user.dto';
import { User } from './schemas/user.schema';
import { UsersService } from './users.service';

import { RouteAccess } from '@/core/decorators/route-access.decorator';

@ApiTags('Users')
@Controller({ path: 'users' })
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @RouteAccess({ action: 'create', subject: 'User' })
  create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @RouteAccess({ action: 'read', subject: 'User' })
  findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Get(':username')
  @RouteAccess({ action: 'read', subject: 'User' })
  findByUsername(@Param('username') username: string): Promise<User> {
    return this.usersService.findByUsername(username);
  }
}
