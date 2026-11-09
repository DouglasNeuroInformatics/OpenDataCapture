import { ApiOperation, CurrentUser } from '@douglasneuroinformatics/libnest';
import type { RequestUser } from '@douglasneuroinformatics/libnest';
import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { $CreateGroupData, $UpdateGroupData } from '@opendatacapture/schemas/group';

import { AuditLogger } from '@/audit/audit.logger';
import type { AppAbility } from '@/auth/auth.types';
import { ADMIN_ONLY, RouteAccess } from '@/core/decorators/route-access.decorator';

import { GroupsService } from './groups.service';

@Controller('groups')
export class GroupsController {
  constructor(
    private readonly groupsService: GroupsService,
    private readonly auditLogger: AuditLogger
  ) {}

  // Gated on `manage all` (admin alone) rather than `create Group`. A group manager holds
  // `manage Group` conditioned on their own groups, and the guard evaluates `@RouteAccess` against
  // the subject type, where CASL ignores conditions -- so `create Group` admits every group
  // manager. A create has no existing row for `GroupsService.create` to scope against either.
  @ApiOperation({ summary: 'Create Group' })
  @Post()
  @RouteAccess(ADMIN_ONLY)
  async create(@Body() data: $CreateGroupData, @CurrentUser() currentUser: RequestUser) {
    const group = await this.groupsService.create(data);
    // Logged here rather than in the service, which demo seeding also calls with no one acting.
    await this.auditLogger.log('CREATE', 'GROUP', { groupId: group.id, userId: currentUser.id });
    return group;
  }

  @ApiOperation({ summary: 'Delete Group' })
  @Delete(':id')
  @RouteAccess({ action: 'delete', subject: 'Group' })
  deleteById(@Param('id') id: string, @CurrentUser('ability') ability?: AppAbility) {
    return this.groupsService.deleteById(id, { ability });
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

  @ApiOperation({ summary: 'Update Group' })
  @Patch(':id')
  @RouteAccess({ action: 'update', subject: 'Group' })
  updateById(@Param('id') id: string, @Body() update: $UpdateGroupData, @CurrentUser() currentUser: RequestUser) {
    return this.groupsService.updateById(id, update, currentUser);
  }
}
