import { VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';

import { json } from 'express';

import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ['error', 'warn', 'debug', 'log', 'verbose']
  });

  app.enableCors();
  app.enableVersioning({
    defaultVersion: '1',
    type: VersioningType.URI
  });
  app.use(json({ limit: '50MB' }));

  const configService = app.get(ConfigService);

  const isProduction = configService.get<string>('NODE_ENV') === 'production';
  const port = isProduction ? 80 : parseInt(configService.getOrThrow('REMOTE_DEV_SERVER_PORT'));

  await app.listen(port);
  console.log(`Application is running on: ${await app.getUrl()}`);
}

void bootstrap();
