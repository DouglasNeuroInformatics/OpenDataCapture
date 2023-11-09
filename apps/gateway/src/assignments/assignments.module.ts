import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AssignmentsController } from './assignments.controller';
import { AssignmentsService } from './assignments.service';
import { AssignmentBundleEntity } from './entities/assignment-bundle.entity';

@Module({
  controllers: [AssignmentsController],
  imports: [TypeOrmModule.forFeature([AssignmentBundleEntity])],
  providers: [AssignmentsService]
})
export class AssignmentsModule {}
