import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_PIPE } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';

import { accessibleFieldsPlugin, accessibleRecordsPlugin } from '@casl/mongoose';
import { Connection } from 'mongoose';

import { AjvModule } from './ajv/ajv.module';
import { AuthModule } from './auth/auth.module';
import { AccessTokenGuard } from './auth/guards/access-token.guard';
import { ExceptionFilter } from './core/exception.filter';
import { LoggerMiddleware } from './core/logger.middleware';
import { ValidationPipe } from './core/validation.pipe';
import { DemoModule } from './demo/demo.module';
import { GroupsModule } from './groups/groups.module';
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
          uri: `${mongoUri}/${env}`
        };
      }
    }),
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
