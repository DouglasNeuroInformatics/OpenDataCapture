import { Module } from '@nestjs/common';

import { DatabaseModule } from '@/database/database.module';

import { DemoService } from './demo.service';

import { InstrumentsModule } from '@/instruments/instruments.module';
import { ResourcesModule } from '@/resources/resources.module';
import { SubjectsModule } from '@/subjects/subjects.module';
import { UsersModule } from '@/users/users.module';

@Module({
  imports: [DatabaseModule, InstrumentsModule, ResourcesModule, SubjectsModule, UsersModule],
  providers: [DemoService]
})
export class DemoModule {}
