import { Module } from '@nestjs/common';

import { GroupsModule } from '@/groups/groups.module';
import { InstrumentRecordsModule } from '@/instrument-records/instrument-records.module';
import { InstrumentsModule } from '@/instruments/instruments.module';
import { PrismaModule } from '@/prisma/prisma.module';
import { SubjectsModule } from '@/subjects/subjects.module';
import { UsersModule } from '@/users/users.module';
import { VisitsModule } from '@/visits/visits.module';

import { DemoService } from './demo.service';
import { SetupController } from './setup.controller';
import { SetupOptions } from './setup.options';
import { SetupService } from './setup.service';

@Module({
  controllers: [SetupController],
  imports: [
    GroupsModule,
    InstrumentRecordsModule,
    InstrumentsModule,
    PrismaModule.forFeature('SetupOption'),
    SubjectsModule,
    UsersModule,
    VisitsModule
  ],
  providers: [DemoService, SetupOptions, SetupService]
})
export class SetupModule {}
