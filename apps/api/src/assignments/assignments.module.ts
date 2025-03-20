import { forwardRef, Module } from '@nestjs/common';

import { GatewayModule } from '@/gateway/gateway.module';

import { AssignmentsController } from './assignments.controller';
import { AssignmentsService } from './assignments.service';

@Module({
  controllers: [AssignmentsController],
  exports: [AssignmentsService],
  imports: [forwardRef(() => GatewayModule)],
  providers: [AssignmentsService]
})
export class AssignmentsModule {}
