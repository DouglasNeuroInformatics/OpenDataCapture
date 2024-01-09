import { Module } from '@nestjs/common';

import { PrismaModule } from '@/prisma/prisma.module';

import { SubjectsController } from './subjects.controller';
import { SubjectsService } from './subjects.service';

@Module({
  controllers: [SubjectsController],
  exports: [SubjectsService],
  imports: [PrismaModule.forFeature('Subject')],
  providers: [SubjectsService]
})
export class SubjectsModule {}
