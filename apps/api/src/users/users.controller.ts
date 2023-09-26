import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import type { AppAbility } from '@open-data-capture/types';

import { CreateUserDto } from './dto/create-user.dto';
import { UserEntity } from './entities/user.entity';
import { UsersService } from './users.service';

import { CurrentUser } from '@/core/decorators/current-user.decorator';
import { RouteAccess } from '@/core/decorators/route-access.decorator';

@ApiTags('Users')
@Controller({ path: 'users' })
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: 'Create User' })
  @Post()
  @RouteAccess({ action: 'create', subject: 'User' })
  create(@Body() createUserDto: CreateUserDto, @CurrentUser('ability') ability: AppAbility): Promise<UserEntity> {
    return this.usersService.create(createUserDto, ability);
  }

  @ApiOperation({ summary: 'Get All Users' })
  @Get()
  @RouteAccess({ action: 'read', subject: 'User' })
  findAll(@CurrentUser('ability') ability: AppAbility, @Query('group') groupName?: string): Promise<UserEntity[]> {
    return this.usersService.findAll(ability, groupName);
  }

  @ApiOperation({ summary: 'Find User' })
  @Get(':username')
  @RouteAccess({ action: 'read', subject: 'User' })
  findByUsername(@Param('username') username: string): Promise<UserEntity> {
    return this.usersService.findByUsername(username);
  }

  @ApiOperation({ summary: 'Delete User' })
  @Delete(':username')
  @RouteAccess({ action: 'delete', subject: 'User' })
  deleteByUsername(@Param('username') username: string): Promise<UserEntity> {
    return this.usersService.deleteByUsername(username);
  }
}
