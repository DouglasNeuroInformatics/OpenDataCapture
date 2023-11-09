import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { InstrumentsModule } from '@/instruments/instruments.module';
import { SubjectsModule } from '@/subjects/subjects.module';

import { AssignmentsController } from './assignments.controller';
import { AssignmentsService } from './assignments.service';
import { AssignmentEntity, AssignmentSchema } from './entities/assignment.entity';

@Module({
  controllers: [AssignmentsController],
  imports: [
    HttpModule,
    InstrumentsModule,
    MongooseModule.forFeature([
      {
        name: AssignmentEntity.modelName,
        schema: AssignmentSchema
      }
    ]),
    SubjectsModule
  ],
  providers: [AssignmentsService]
})
export class AssignmentsModule {}
