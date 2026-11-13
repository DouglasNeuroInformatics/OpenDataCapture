import { ApiOperation, CurrentUser } from '@douglasneuroinformatics/libnest';
import type { RequestUser } from '@douglasneuroinformatics/libnest';
import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { $CreateGroupData, $UpdateGroupData } from '@opendatacapture/schemas/group';

import type { AppAbility } from '@/auth/auth.types';
import { ADMIN_ONLY, RouteAccess } from '@/core/decorators/route-access.decorator';

import { GroupsService } from './groups.service';

@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  // Archiving replaces deletion, and is gated on `manage all` for the reason `create` below is: a
  // group manager's `manage Group` rule covers their own groups, so any `Group` action would let
  // them take a group out of service from under its other members.
  @ApiOperation({ summary: 'Archive Group' })
  @Patch(':id/archive')
  @RouteAccess(ADMIN_ONLY)
  archiveById(@Param('id') id: string, @CurrentUser() currentUser: RequestUser) {
    return this.groupsService.archiveById(id, currentUser);
  }

  // Gated on `manage all` (admin alone) rather than `create Group`. A group manager holds
  // `manage Group` conditioned on their own groups, and the guard evaluates `@RouteAccess` against
  // the subject type, where CASL ignores conditions -- so `create Group` admits every group
  // manager. A create has no existing row for `GroupsService.create` to scope against either.
  @ApiOperation({ summary: 'Create Group' })
  @Post()
  @RouteAccess(ADMIN_ONLY)
  create(@Body() data: $CreateGroupData) {
    return this.groupsService.create(data);
  }

  @ApiOperation({ summary: 'Get All Groups' })
  @Get()
  @RouteAccess({ action: 'read', subject: 'Group' })
  findAll(@CurrentUser('ability') ability?: AppAbility) {
    return this.groupsService.findAll({ ability });
  }

  @ApiOperation({ summary: 'Get Group' })
  @Get(':id')
  @RouteAccess({ action: 'read', subject: 'Group' })
  findById(@Param('id') id: string, @CurrentUser('ability') ability?: AppAbility) {
    return this.groupsService.findById(id, { ability });
  }

  @ApiOperation({ summary: 'Unarchive Group' })
  @Patch(':id/unarchive')
  @RouteAccess(ADMIN_ONLY)
  unarchiveById(@Param('id') id: string, @CurrentUser() currentUser: RequestUser) {
    return this.groupsService.unarchiveById(id, currentUser);
  }

  @ApiOperation({ summary: 'Update Group' })
  @Patch(':id')
  @RouteAccess({ action: 'update', subject: 'Group' })
  updateById(@Param('id') id: string, @Body() update: $UpdateGroupData, @CurrentUser('ability') ability?: AppAbility) {
    return this.groupsService.updateById(id, update, { ability });
  }
}
