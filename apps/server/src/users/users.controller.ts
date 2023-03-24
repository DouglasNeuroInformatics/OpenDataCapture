import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';

import { EntityController } from '@/core/abstract/entity.controller';
import { RouteAccess } from '@/core/decorators/route-access.decorator';

@ApiTags('Users')
@Controller({ path: 'users' })
export class UsersController implements EntityController<User> {
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
