import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { type AppAbility } from '@douglasneuroinformatics/common';

import { CreateGroupDto } from './dto/create-group.dto.js';
import { UpdateGroupDto } from './dto/update-group.dto.js';
import { GroupEntity } from './entities/group.entity.js';
import { GroupsService } from './groups.service.js';

import { RouteAccess } from '@/core/decorators/route-access.decorator.js';
import { UserAbility } from '@/core/decorators/user-ability.decorator.js';

@ApiTags('Groups')
@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @ApiOperation({ description: 'Adds a new group to the database' })
  @Post()
  @RouteAccess({ action: 'create', subject: 'Group' })
  create(@Body() createGroupDto: CreateGroupDto): Promise<GroupEntity> {
    return this.groupsService.create(createGroupDto);
  }

  @ApiOperation({ description: 'Returns all groups in the database' })
  @Get()
  @RouteAccess({ action: 'read', subject: 'Group' })
  findAll(@UserAbility() ability: AppAbility): Promise<GroupEntity[]> {
    return this.groupsService.findAll(ability);
  }

  @ApiOperation({ description: 'Returns the group with the provided name' })
  @Get(':name')
  @RouteAccess({ action: 'read', subject: 'Group' })
  findByName(@Param('name') name: string, @UserAbility() ability: AppAbility): Promise<GroupEntity> {
    return this.groupsService.findByName(name, ability);
  }

  @ApiOperation({ description: 'Returns the updated group' })
  @Patch(':name')
  @RouteAccess({ action: 'update', subject: 'Group' })
  update(@Param('name') name: string, @Body() updateGroupDto: UpdateGroupDto): Promise<GroupEntity> {
    return this.groupsService.update(name, updateGroupDto);
  }

  @ApiOperation({ description: 'Returns the deleted user' })
  @Delete(':name')
  @RouteAccess({ action: 'delete', subject: 'Group' })
  remove(@Param('name') name: string): Promise<GroupEntity> {
    return this.groupsService.remove(name);
  }
}
