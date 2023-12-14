import { Module } from '@nestjs/common';

import { GroupsModule } from '@/groups/groups.module';
import { PrismaModule } from '@/prisma/prisma.module';

import { SubjectsController } from './subjects.controller';
import { SubjectsService } from './subjects.service';

@Module({
  controllers: [SubjectsController],
  exports: [SubjectsService],
  imports: [GroupsModule, PrismaModule.forFeature('Subject')],
  providers: [SubjectsService]
})
export class SubjectsModule {}
