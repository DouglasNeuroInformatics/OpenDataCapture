import { Module } from '@nestjs/common';

import { AbilityFactory } from './ability.factory';

@Module({
  exports: [AbilityFactory],
  providers: [AbilityFactory]
})
export class AbilityModule {}
