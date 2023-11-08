import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AssignmentsModule } from './assignments/assignments.module';

@Module({
  imports: [
    AssignmentsModule,
    ConfigModule.forRoot({
      isGlobal: true
    })
  ]
})
export class AppModule {}
