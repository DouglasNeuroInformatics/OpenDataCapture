import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { InstrumentsModule } from '@/instruments/instruments.module';
import { SubjectsModule } from '@/subjects/subjects.module';

import { AssignmentsController } from './assignments.controller';
import { AssignmentsRepository } from './assignments.repository';
import { AssignmentsService } from './assignments.service';
import { AssignmentEntity, AssignmentSchema } from './entities/assignment.entity';
import { GatewayService } from './gateway.service';

@Module({
  controllers: [AssignmentsController],
  imports: [
    InstrumentsModule,
    MongooseModule.forFeature([
      {
        name: AssignmentEntity.modelName,
        schema: AssignmentSchema
      }
    ]),
    SubjectsModule
  ],
  providers: [AssignmentsRepository, AssignmentsService, GatewayService]
})
export class AssignmentsModule {}
