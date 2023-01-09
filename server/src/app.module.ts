import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import Joi from 'joi';

import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        MONGO_DEV_CONNECTION_URI: Joi.string().required(),
        MONGO_TEST_CONNECTION_URI: Joi.string().required(),
        NODE_ENV: Joi.string().valid('development', 'production', 'test').required(),
        SERVER_PORT: Joi.number().required(),
        SECRET_KEY: Joi.string().required()
      })
    }),
    ConfigModule
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
