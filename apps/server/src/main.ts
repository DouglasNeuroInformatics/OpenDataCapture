import { VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';

import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableCors();
  app.enableVersioning({
    type: VersioningType.URI
  });
  app.setGlobalPrefix('/api');
  await app.listen(5500);
  console.log(`Application is running on: ${await app.getUrl()}`);
}

void bootstrap();
