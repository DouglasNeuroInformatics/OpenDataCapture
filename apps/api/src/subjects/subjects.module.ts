import { DatabaseModule } from '@douglasneuroinformatics/nestjs/modules';
import { Module } from '@nestjs/common';

import { GroupsModule } from '@/groups/groups.module';

import { SubjectEntity} from './entities/subject.entity';
import { SubjectsController } from './subjects.controller';
import { SubjectsService } from './subjects.service';

@Module({
  controllers: [SubjectsController],
  exports: [SubjectsService],
  imports: [DatabaseModule.forFeature([SubjectEntity]), GroupsModule],
  providers: [SubjectsService]
})
export class SubjectsModule {}
