import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_PIPE } from '@nestjs/core';

import { AuthModule } from './auth/auth.module';
import { AjvValidationPipe } from './core/ajv-validation.pipe';
import { UsersModule } from './users/users.module';

@Module({
  imports: [AuthModule, ConfigModule.forRoot(), UsersModule],
  providers: [
    {
      provide: APP_PIPE,
      useClass: AjvValidationPipe
    }
  ]
})
export class AppModule {}
