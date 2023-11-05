import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { GroupsModule } from '@/groups/groups.module';

import { SubjectEntity, SubjectSchema } from './entities/subject.entity';
import { SubjectsController } from './subjects.controller';
import { SubjectsRepository } from './subjects.repository';
import { SubjectsService } from './subjects.service';

@Module({
  controllers: [SubjectsController],
  exports: [SubjectsService],
  imports: [
    GroupsModule,
    MongooseModule.forFeature([
      {
        name: SubjectEntity.modelName,
        schema: SubjectSchema
      }
    ])
  ],
  providers: [SubjectsRepository, SubjectsService]
})
export class SubjectsModule {}
