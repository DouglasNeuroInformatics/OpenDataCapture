import { Module } from '@nestjs/common';

import { FakerService } from './faker.service';

@Module({
  providers: [FakerService],
  exports: [FakerService]
})
export class FakerModule {}
