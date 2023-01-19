import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';

import Joi from 'joi';

import { AuthModule } from './auth/auth.module';
import { AccessTokenGuard } from './auth/guards/access-token.guard';
import { ExceptionFilter } from './core/exception.filter';
import { DatabaseModule } from './database/database.module';
import { DemoModule } from './demo/demo.module';
import { DocsModule } from './docs/docs.module';
import { InstrumentsModule } from './instruments/instruments.module';
import { ResourcesModule } from './resources/resources.module';
import { SubjectsModule } from './subjects/subjects.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    AuthModule,
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        INIT_DEMO_DB: Joi.boolean().optional(),
        MONGO_DEV_CONNECTION_URI: Joi.string().required(),
        MONGO_DEMO_CONNECTION_URI: Joi.string().required(),
        MONGO_TEST_CONNECTION_URI: Joi.string().required(),
        NODE_ENV: Joi.string().valid('development', 'demo', 'test').required(),
        SERVER_PORT: Joi.number().required(),
        SECRET_KEY: Joi.string().required()
      })
    }),
    DatabaseModule,
    DemoModule,
    DocsModule,
    ResourcesModule,
    InstrumentsModule,
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
      useClass: AccessTokenGuard
    }
  ]
})
export class AppModule {}
