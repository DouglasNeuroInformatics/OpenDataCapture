import { Module } from '@nestjs/common';

import { DemoService } from './demo.service';

@Module({
  providers: [DemoService]
})
export class DemoModule {}
