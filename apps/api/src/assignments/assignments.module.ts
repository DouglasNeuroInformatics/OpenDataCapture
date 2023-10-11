import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AssignmentsController } from './assignments.controller';
import { AssignmentsService } from './assignments.service';
import { AssignmentEntity, AssignmentSchema } from './entities/assignment.entity';

@Module({
  controllers: [AssignmentsController],
  imports: [
    MongooseModule.forFeature([
      {
        name: AssignmentEntity.modelName,
        schema: AssignmentSchema
      }
    ])
  ],
  providers: [AssignmentsService]
})
export class AssignmentsModule {}
