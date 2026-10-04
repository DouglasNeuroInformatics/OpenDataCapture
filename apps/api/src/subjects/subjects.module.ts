import { Module } from '@nestjs/common';

import { StorageModule } from '@/storage/storage.module';

import { SubjectsController } from './subjects.controller';
import { SubjectsService } from './subjects.service';

@Module({
  controllers: [SubjectsController],
  exports: [SubjectsService],
  imports: [StorageModule],
  providers: [SubjectsService]
})
export class SubjectsModule {}
