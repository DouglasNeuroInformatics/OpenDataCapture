import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { SubjectEntity, SubjectSchema } from './entities/subject.entity';
import { SubjectsController } from './subjects.controller';
import { SubjectsRepository } from './subjects.repository';
import { SubjectsService } from './subjects.service';

import { CryptoModule } from '@/crypto/crypto.module';
import { GroupsModule } from '@/groups/groups.module';

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
