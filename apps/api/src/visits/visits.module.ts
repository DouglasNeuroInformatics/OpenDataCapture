import { Module } from '@nestjs/common';

import { GroupsModule } from '@/groups/groups.module';
import { PrismaModule } from '@/prisma/prisma.module';
import { SubjectsModule } from '@/subjects/subjects.module';

import { VisitsController } from './visits.controller';
import { VisitsService } from './visits.service';

@Module({
  controllers: [VisitsController],
  exports: [VisitsService],
  imports: [
    GroupsModule,
    PrismaModule.forFeature('Visit'),
    SubjectsModule
  ],
  providers: [VisitsService]
})
export class VisitsModule {}
