import { Global, Module } from '@nestjs/common';

import { AbilityFactory } from './ability.factory';

@Global()
@Module({
  exports: [AbilityFactory],
  providers: [AbilityFactory]
})
export class AbilityModule {}
