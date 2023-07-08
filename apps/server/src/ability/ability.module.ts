import { Module } from '@nestjs/common';

import { AbilityFactory } from './ability.factory.js';

@Module({
  providers: [AbilityFactory],
  exports: [AbilityFactory]
})
export class AbilityModule {}
