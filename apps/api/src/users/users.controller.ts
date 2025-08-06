import { CurrentUser, RouteAccess } from '@douglasneuroinformatics/libnest';
import type { AppAbility } from '@douglasneuroinformatics/libnest';
import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@ApiTags('Users')
@Controller({ path: 'users' })
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

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

  @ApiOperation({ summary: 'Get User by Username' })
  @Get('/Check-Username/:username')
  @RouteAccess({ action: 'read', subject: 'User' })
  findByUsername(@Param('username') username: string, @CurrentUser('ability') ability: AppAbility) {
    return this.usersService.findByUsername(username, { ability });
  }

  @ApiOperation({ summary: 'Update User' })
  @Patch(':id')
  @RouteAccess({ action: 'update', subject: 'User' })
  updateById(@Param('id') id: string, @Body() update: UpdateUserDto, @CurrentUser('ability') ability: AppAbility) {
    return this.usersService.updateById(id, update, { ability });
  }
}
