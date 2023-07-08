import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { type AppAbility } from '@douglasneuroinformatics/common';

import { CreateUserDto } from './dto/create-user.dto.js';
import { UserEntity } from './entities/user.entity.js';
import { UsersService } from './users.service.js';

import { RouteAccess } from '@/core/decorators/route-access.decorator.js';
import { UserAbility } from '@/core/decorators/user-ability.decorator.js';

@ApiTags('Users')
@Controller({ path: 'users' })
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @RouteAccess({ action: 'create', subject: 'User' })
  create(@Body() createUserDto: CreateUserDto, @UserAbility() ability: AppAbility): Promise<UserEntity> {
    return this.usersService.create(createUserDto, ability);
  }

  @Get()
  @RouteAccess({ action: 'read', subject: 'User' })
  findAll(@UserAbility() ability: AppAbility, @Query('group') groupName?: string): Promise<UserEntity[]> {
    return this.usersService.findAll(ability, groupName);
  }

  @Get(':username')
  @RouteAccess({ action: 'read', subject: 'User' })
  findByUsername(@Param('username') username: string): Promise<UserEntity> {
    return this.usersService.findByUsername(username);
  }

  @Delete(':username')
  @RouteAccess({ action: 'delete', subject: 'User' })
  deleteByUsername(@Param('username') username: string): Promise<UserEntity> {
    return this.usersService.deleteByUsername(username);
  }
}
