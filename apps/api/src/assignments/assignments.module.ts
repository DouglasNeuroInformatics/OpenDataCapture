import { Module, forwardRef } from '@nestjs/common';

import { GatewayModule } from '@/gateway/gateway.module';
import { PrismaModule } from '@/prisma/prisma.module';

import { AssignmentsController } from './assignments.controller';
import { AssignmentsService } from './assignments.service';

@Module({
  controllers: [AssignmentsController],
  exports: [AssignmentsService],
  imports: [forwardRef(() => GatewayModule), PrismaModule.forFeature('Assignment')],
  providers: [AssignmentsService]
})
export class AssignmentsModule {}
