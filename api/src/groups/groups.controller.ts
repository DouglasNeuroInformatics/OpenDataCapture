import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { type AppAbility } from '@ddcp/types';

import { CreateGroupDto } from './dto/create-group.dto.js';
import { UpdateGroupDto } from './dto/update-group.dto.js';
import { GroupEntity } from './entities/group.entity.js';
import { GroupsService } from './groups.service.js';

import { CurrentUser } from '@/core/decorators/current-user.decorator.js';
import { RouteAccess } from '@/core/decorators/route-access.decorator.js';

@ApiTags('Groups')
@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @ApiOperation({ description: 'Adds a new group to the database', summary: 'Create Group' })
  @Post()
  @RouteAccess({ action: 'create', subject: 'Group' })
  create(@Body() createGroupDto: CreateGroupDto): Promise<GroupEntity> {
    return this.groupsService.create(createGroupDto);
  }

  @ApiOperation({ description: 'Returns all groups in the database', summary: 'Get All Groups' })
  @Get()
  @RouteAccess({ action: 'read', subject: 'Group' })
  findAll(@CurrentUser('ability') ability: AppAbility): Promise<GroupEntity[]> {
    return this.groupsService.findAll(ability);
  }

  @ApiOperation({ description: 'Returns the group with the provided name', summary: 'Find Group' })
  @Get(':name')
  @RouteAccess({ action: 'read', subject: 'Group' })
  findByName(@Param('name') name: string, @CurrentUser('ability') ability: AppAbility): Promise<GroupEntity> {
    return this.groupsService.findByName(name, ability);
  }

  @ApiOperation({ description: 'Returns the updated group', summary: 'Update Group' })
  @Patch(':name')
  @RouteAccess({ action: 'update', subject: 'Group' })
  update(@Param('name') name: string, @Body() updateGroupDto: UpdateGroupDto): Promise<GroupEntity> {
    return this.groupsService.update(name, updateGroupDto);
  }

  @ApiOperation({ description: 'Returns the deleted user', summary: 'Delete Group' })
  @Delete(':name')
  @RouteAccess({ action: 'delete', subject: 'Group' })
  remove(@Param('name') name: string): Promise<GroupEntity> {
    return this.groupsService.remove(name);
  }
}
