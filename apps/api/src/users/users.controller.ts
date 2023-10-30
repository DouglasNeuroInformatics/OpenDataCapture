import { CurrentUser, type EntityController, ParseIdPipe } from '@douglasneuroinformatics/nestjs/core';
import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { AppAbility } from '@open-data-capture/common/core';
import type { User } from '@open-data-capture/common/user';

import { RouteAccess } from '@/core/decorators/route-access.decorator';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@ApiTags('Users')
@Controller({ path: 'users' })
export class UsersController implements EntityController<User> {
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
  deleteById(@Param('id', ParseIdPipe) id: string, @CurrentUser('ability') ability: AppAbility) {
    return this.usersService.deleteById(id, { ability });
  }

  @ApiOperation({ summary: 'Get All Users' })
  @Get()
  @RouteAccess({ action: 'read', subject: 'User' })
  findAll(@CurrentUser('ability') ability: AppAbility, @Query('group') groupName?: string) {
    return groupName ? this.usersService.findByGroup(groupName, { ability }) : this.usersService.findAll({ ability });
  }

  @ApiOperation({ summary: 'Get User' })
  @Get(':id')
  @RouteAccess({ action: 'read', subject: 'User' })
  findById(@Param('id', ParseIdPipe) id: string, @CurrentUser('ability') ability: AppAbility) {
    return this.usersService.findById(id, { ability });
  }

  @ApiOperation({ summary: 'Update User' })
  @Patch(':id')
  @RouteAccess({ action: 'update', subject: 'User' })
  updateById(
    @Param('id', ParseIdPipe) id: string,
    @Body() update: UpdateUserDto,
    @CurrentUser('ability') ability: AppAbility
  ) {
    return this.usersService.updateById(id, update, { ability });
  }
}
