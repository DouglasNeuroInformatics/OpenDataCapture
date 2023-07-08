import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { SubjectEntity, SubjectSchema } from './entities/subject.entity.js';
import { SubjectsController } from './subjects.controller.js';
import { SubjectsRepository } from './subjects.repository.js';
import { SubjectsService } from './subjects.service.js';

import { CryptoModule } from '@/crypto/crypto.module.js';
import { GroupsModule } from '@/groups/groups.module.js';

@Module({
  imports: [
    CryptoModule,
    GroupsModule,
    MongooseModule.forFeature([
      {
        name: SubjectEntity.modelName,
        schema: SubjectSchema
      }
    ])
  ],
  controllers: [SubjectsController],
  providers: [SubjectsRepository, SubjectsService],
  exports: [SubjectsService]
})
export class SubjectsModule {}
