import { MiddlewareConsumer, Module, NestModule, ValidationPipe } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_PIPE } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

import { accessibleFieldsPlugin, accessibleRecordsPlugin } from '@casl/mongoose';
import { Connection } from 'mongoose';

import { AbilityModule } from './ability/ability.module.js';
import { AjvModule } from './ajv/ajv.module.js';
import { AuthModule } from './auth/auth.module.js';
import { AuthenticationGuard } from './auth/guards/authentication.guard.js';
import { AuthorizationGuard } from './auth/guards/authorization.guard.js';
import { ExceptionFilter } from './core/exception.filter.js';
import { LoggerMiddleware } from './core/middleware/logger.middleware.js';
import { GroupsModule } from './groups/groups.module.js';
import { InstrumentsModule } from './instruments/instruments.module.js';
import { SetupModule } from './setup/setup.module.js';
import { SubjectsModule } from './subjects/subjects.module.js';
import { UsersModule } from './users/users.module.js';

@Module({
  imports: [
    AbilityModule,
    AjvModule,
    AuthModule,
    ConfigModule.forRoot({
      isGlobal: true
    }),
    GroupsModule,
    InstrumentsModule,
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const env = configService.getOrThrow<string>('NODE_ENV');
        const mongoUri = configService.getOrThrow<string>('MONGO_URI');
        return {
          connectionFactory: (connection: Connection): Connection => {
            connection.plugin(accessibleFieldsPlugin);
            connection.plugin(accessibleRecordsPlugin);
            return connection;
          },
          ignoreUndefined: true,
          uri: `${mongoUri}/data-capture-${env}`
        };
      }
    }),
    SubjectsModule,
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,
        limit: 3,
      },
      {
        name: 'medium',
        ttl: 10000,
        limit: 20
      },
      {
        name: 'long',
        ttl: 60000,
        limit: 100
      }
    ]),
    UsersModule,
    SetupModule
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: ExceptionFilter
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard
    },
    {
      provide: APP_GUARD,
      useClass: AuthenticationGuard
    },
    {
      provide: APP_GUARD,
      useClass: AuthorizationGuard
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
