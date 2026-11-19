import { Module } from '@nestjs/common';

import { InstrumentsModule } from '@/instruments/instruments.module';

import { GroupsController } from './groups.controller';
import { GroupsService } from './groups.service';

@Module({
  controllers: [GroupsController],
  exports: [GroupsService],
  imports: [InstrumentsModule],
  providers: [GroupsService]
})
export class GroupsModule {}
