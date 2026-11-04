import { Module } from '@nestjs/common';

import { PermissionSetsController } from './permission-sets.controller';
import { PermissionSetsService } from './permission-sets.service';

@Module({
  controllers: [PermissionSetsController],
  exports: [PermissionSetsService],
  providers: [PermissionSetsService]
})
export class PermissionSetsModule {}
