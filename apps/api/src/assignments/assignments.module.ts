import { forwardRef, Module } from '@nestjs/common';

import { GatewayModule } from '@/gateway/gateway.module';
import { GroupsModule } from '@/groups/groups.module';
import { MailModule } from '@/mail/mail.module';

import { AssignmentsController } from './assignments.controller';
import { AssignmentsService } from './assignments.service';

@Module({
  controllers: [AssignmentsController],
  exports: [AssignmentsService],
  imports: [forwardRef(() => GatewayModule), GroupsModule, MailModule],
  providers: [AssignmentsService]
})
export class AssignmentsModule {}
