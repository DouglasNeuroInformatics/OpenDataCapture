import { Module } from '@nestjs/common';

import { VirtualizationService } from './virtualization.service';

@Module({
  exports: [VirtualizationService],
  providers: [VirtualizationService]
})
export class VirtualizationModule {}
