import { forwardRef, Module } from '@nestjs/common';

import { GatewayModule } from '@/gateway/gateway.module';
import { GroupsModule } from '@/groups/groups.module';
import { InstrumentsModule } from '@/instruments/instruments.module';
import { MailModule } from '@/mail/mail.module';

import { AssignmentsController } from './assignments.controller';
import { AssignmentsService } from './assignments.service';

@Module({
  controllers: [AssignmentsController],
  exports: [AssignmentsService],
  imports: [forwardRef(() => GatewayModule), GroupsModule, InstrumentsModule, MailModule],
  providers: [AssignmentsService]
})
export class AssignmentsModule {}
