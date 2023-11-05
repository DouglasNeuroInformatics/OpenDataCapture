import { CurrentUser, type EntityController, ParseIdPipe } from '@douglasneuroinformatics/nestjs/core';
import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { AppAbility } from '@open-data-capture/common/core';
import type { Group } from '@open-data-capture/common/group';

import { RouteAccess } from '@/core/decorators/route-access.decorator';

import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { GroupsService } from './groups.service';

@ApiTags('Groups')
@Controller('groups')
export class GroupsController implements EntityController<Group> {
  constructor(private readonly groupsService: GroupsService) {}

  @ApiOperation({ summary: 'Create Group' })
  @Post()
  @RouteAccess({ action: 'create', subject: 'Group' })
  create(@Body() createGroupDto: CreateGroupDto) {
    return this.groupsService.create(createGroupDto);
  }

  @ApiOperation({ summary: 'Delete Group' })
  @Delete(':id')
  @RouteAccess({ action: 'delete', subject: 'Group' })
  deleteById(@Param('id', ParseIdPipe) id: string, @CurrentUser('ability') ability: AppAbility) {
    return this.groupsService.deleteById(id, { ability });
  }

  @ApiOperation({ summary: 'Get All Groups' })
  @Get()
  @RouteAccess({ action: 'read', subject: 'Group' })
  findAll(@CurrentUser('ability') ability: AppAbility) {
    return this.groupsService.findAll({ ability });
  }

  @ApiOperation({ summary: 'Get Group' })
  @Get(':id')
  @RouteAccess({ action: 'read', subject: 'Group' })
  findById(@Param('id', ParseIdPipe) id: string, @CurrentUser('ability') ability: AppAbility) {
    return this.groupsService.findById(id, { ability });
  }

  @ApiOperation({ summary: 'Update Group' })
  @Patch(':id')
  @RouteAccess({ action: 'update', subject: 'Group' })
  updateById(
    @Param('id', ParseIdPipe) id: string,
    @Body() update: UpdateGroupDto,
    @CurrentUser('ability') ability: AppAbility
  ) {
    return this.groupsService.updateById(id, update, { ability });
  }
}
