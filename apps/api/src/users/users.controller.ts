import { CurrentUser } from '@douglasneuroinformatics/libnest';
import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import type { AppAbility } from '@/auth/auth.types';
import { RouteAccess } from '@/core/decorators/route-access.decorator';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';
@ApiTags('Users')
@Controller({ path: 'users' })
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: 'Get User by Username' })
  @Get('/check-username/:username')
  @RouteAccess({ action: 'read', subject: 'User' })
  checkUsernameExists(@Param('username') username: string, @CurrentUser('ability') ability: AppAbility) {
    return this.usersService.checkUsernameExists(username, { ability });
  }

  @ApiOperation({ summary: 'Create User' })
  @Post()
  @RouteAccess({ action: 'create', subject: 'User' })
  create(@Body() user: CreateUserDto, @CurrentUser('ability') ability: AppAbility) {
    return this.usersService.create(user, { ability });
  }

  @ApiOperation({ summary: 'Delete User' })
  @Delete(':id')
  @RouteAccess({ action: 'delete', subject: 'User' })
  deleteById(@Param('id') id: string, @CurrentUser('ability') ability: AppAbility) {
    return this.usersService.deleteById(id, { ability });
  }

  @ApiOperation({ summary: 'Get All Users' })
  @Get()
  @RouteAccess({ action: 'read', subject: 'User' })
  find(@CurrentUser('ability') ability: AppAbility, @Query('groupId') groupId?: string) {
    return this.usersService.find({ groupId }, { ability });
  }

  @ApiOperation({ summary: 'Get User' })
  @Get(':id')
  @RouteAccess({ action: 'read', subject: 'User' })
  findById(@Param('id') id: string, @CurrentUser('ability') ability: AppAbility) {
    return this.usersService.findById(id, { ability });
  }

  @ApiOperation({ summary: 'Update User' })
  @Patch(':id')
  @RouteAccess({ action: 'update', subject: 'User' })
  updateById(@Param('id') id: string, @Body() update: UpdateUserDto, @CurrentUser('ability') ability: AppAbility) {
    return this.usersService.updateById(id, update, { ability });
  }
}
