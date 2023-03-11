import { Module } from '@nestjs/common';

import { PermissionsFactory } from './permissions.factory';

@Module({
  providers: [PermissionsFactory],
  exports: [PermissionsFactory]
})
export class PermissionsModule {}
