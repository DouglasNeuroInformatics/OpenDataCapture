import { Global, Module } from '@nestjs/common';

import { AbilityFactory } from './ability.factory';
import { AbilityService } from './ability.service';

@Global()
@Module({
  exports: [AbilityFactory, AbilityService],
  providers: [AbilityFactory, AbilityService]
})
export class AbilityModule {}
