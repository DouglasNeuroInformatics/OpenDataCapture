import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_PIPE } from '@nestjs/core';

import { AuthModule } from './auth/auth.module';
import { AccessTokenGuard } from './auth/guards/access-token.guard';
import { ExceptionFilter } from './core/exception.filter';
import { LoggerMiddleware } from './core/logger.middleware';
import { ValidationPipe } from './core/validation.pipe';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    AuthModule,
    ConfigModule.forRoot({
      isGlobal: true
    }),
    DatabaseModule,
    UsersModule
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: ExceptionFilter
    },
    {
      provide: APP_GUARD,
      useClass: AccessTokenGuard
    },
    {
      provide: APP_PIPE,
      useClass: ValidationPipe
    }
  ]
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
