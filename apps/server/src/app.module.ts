import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_PIPE } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';

import { accessibleFieldsPlugin, accessibleRecordsPlugin } from '@casl/mongoose';
import { Connection } from 'mongoose';

import { AbilityModule } from './ability/ability.module';
import { AjvModule } from './ajv/ajv.module';
import { AuthModule } from './auth/auth.module';
import { AuthenticationGuard } from './auth/guards/authentication.guard';
import { AuthorizationGuard } from './auth/guards/authorization.guard';
import { ExceptionFilter } from './core/exception.filter';
import { LoggerMiddleware } from './core/middleware/logger.middleware';
import { ValidationPipe } from './core/pipes/validation.pipe';
import { DemoModule } from './demo/demo.module';
import { GroupsModule } from './groups/groups.module';
import { InstrumentsModule } from './instruments/instruments.module';
import { SubjectsModule } from './subjects/subjects.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    AjvModule,
    AuthModule,
    ConfigModule.forRoot({
      isGlobal: true
    }),
    DemoModule,
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
          uri: `${mongoUri}/${env}`
        };
      }
    }),
    AbilityModule,
    SubjectsModule,
    UsersModule
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: ExceptionFilter
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
