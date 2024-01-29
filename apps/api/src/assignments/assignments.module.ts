import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { InstrumentsModule } from '@/instruments/instruments.module';
import { PrismaModule } from '@/prisma/prisma.module';
import { SubjectsModule } from '@/subjects/subjects.module';

import { AssignmentsController } from './assignments.controller';
import { AssignmentsService } from './assignments.service';

@Module({
  controllers: [AssignmentsController],
  exports: [AssignmentsService],
  imports: [HttpModule, InstrumentsModule, PrismaModule.forFeature('Assignment'), SubjectsModule],
  providers: [AssignmentsService]
})
export class AssignmentsModule {}
