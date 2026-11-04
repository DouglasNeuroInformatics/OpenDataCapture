import { ApiOperation, CurrentUser, ValidObjectIdPipe } from '@douglasneuroinformatics/libnest';
import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { $CreatePermissionSetData, $UpdatePermissionSetData } from '@opendatacapture/schemas/permission-set';

import type { AppAbility } from '@/auth/auth.types';
import { ADMIN_ONLY, RouteAccess } from '@/core/decorators/route-access.decorator';

import { PermissionSetsService } from './permission-sets.service';

/**
 * Every route is admin-only, reads included. Editing a set changes what each of its holders may do,
 * so a write is a grant, and only an administrator may grant; holders have no use for reading it.
 */
@Controller('permission-sets')
export class PermissionSetsController {
  constructor(private readonly permissionSetsService: PermissionSetsService) {}

  @ApiOperation({ summary: 'Create Permission Set' })
  @Post()
  @RouteAccess(ADMIN_ONLY)
  create(@Body() data: $CreatePermissionSetData) {
    return this.permissionSetsService.create(data);
  }

  @ApiOperation({ summary: 'Delete Permission Set' })
  @Delete(':id')
  @RouteAccess(ADMIN_ONLY)
  deleteById(@Param('id', ValidObjectIdPipe) id: string, @CurrentUser('ability') ability: AppAbility) {
    return this.permissionSetsService.deleteById(id, { ability });
  }

  @ApiOperation({ summary: 'Get All Permission Sets' })
  @Get()
  @RouteAccess(ADMIN_ONLY)
  findAll(@CurrentUser('ability') ability: AppAbility) {
    return this.permissionSetsService.findAll({ ability });
  }

  @ApiOperation({ summary: 'Get Permission Set' })
  @Get(':id')
  @RouteAccess(ADMIN_ONLY)
  findById(@Param('id', ValidObjectIdPipe) id: string, @CurrentUser('ability') ability: AppAbility) {
    return this.permissionSetsService.findById(id, { ability });
  }

  @ApiOperation({ summary: 'Update Permission Set' })
  @Patch(':id')
  @RouteAccess(ADMIN_ONLY)
  updateById(
    @Param('id', ValidObjectIdPipe) id: string,
    @Body() update: $UpdatePermissionSetData,
    @CurrentUser('ability') ability: AppAbility
  ) {
    return this.permissionSetsService.updateById(id, update, { ability });
  }
}
