import { Module } from '@nestjs/common';
import { MongooseModule, SchemaFactory } from '@nestjs/mongoose';

import { GroupsModule } from '@/groups/groups.module';
import { SubjectsModule } from '@/subjects/subjects.module';

import { VisitEntity } from './entities/visit.entity';
import { VisitsController } from './visits.controller';
import { VisitsRepository } from './visits.repository';
import { VisitsService } from './visits.service';

@Module({
  controllers: [VisitsController],
  imports: [
    GroupsModule,
    MongooseModule.forFeature([
      {
        name: VisitEntity.modelName,
        schema: SchemaFactory.createForClass(VisitEntity)
      }
    ]),
    SubjectsModule
  ],
  providers: [VisitsRepository, VisitsService]
})
export class VisitsModule {}
