import { type EntityController, ParseIdPipe } from '@douglasneuroinformatics/nestjs/core';
import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { type Group } from '@open-data-capture/types';

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
  deleteById(@Param('id', ParseIdPipe) id: string) {
    return this.groupsService.deleteById(id);
  }

  @ApiOperation({ summary: 'Get All Groups' })
  @Get()
  @RouteAccess({ action: 'read', subject: 'Group' })
  findAll() {
    return this.groupsService.findAll();
  }

  @ApiOperation({ summary: 'Get Group' })
  @Get(':id')
  @RouteAccess({ action: 'read', subject: 'Group' })
  findById(@Param('id', ParseIdPipe) id: string) {
    return this.groupsService.findById(id);
  }

  @ApiOperation({ summary: 'Update Group' })
  @Patch(':id')
  @RouteAccess({ action: 'update', subject: 'Group' })
  updateById(@Param('id', ParseIdPipe) id: string, @Body() update: UpdateGroupDto) {
    return this.groupsService.updateById(id, update);
  }
}
