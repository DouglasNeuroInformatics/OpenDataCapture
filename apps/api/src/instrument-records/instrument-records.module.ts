import { Module } from '@nestjs/common';

import { GroupsModule } from '@/groups/groups.module';
import { InstrumentsModule } from '@/instruments/instruments.module';
import { SessionsModule } from '@/sessions/sessions.module';
import { StorageModule } from '@/storage/storage.module';
import { SubjectsModule } from '@/subjects/subjects.module';

import { FilesController } from './files/files.controller';
import { FilesService } from './files/files.service';
import { InstrumentMeasuresService } from './instrument-measures.service';
import { InstrumentRecordsController } from './instrument-records.controller';
import { InstrumentRecordsService } from './instrument-records.service';

@Module({
  controllers: [FilesController, InstrumentRecordsController],
  exports: [InstrumentRecordsService],
  imports: [GroupsModule, InstrumentsModule, SessionsModule, SubjectsModule, StorageModule],
  providers: [FilesService, InstrumentMeasuresService, InstrumentRecordsService]
})
export class InstrumentRecordsModule {}
