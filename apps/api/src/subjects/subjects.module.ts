import { Module } from '@nestjs/common';

import { SubjectsController } from './subjects.controller';
import { SubjectsService } from './subjects.service';

@Module({
  controllers: [SubjectsController],
  exports: [SubjectsService],
  providers: [SubjectsService]
})
export class SubjectsModule {}
