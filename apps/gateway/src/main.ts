import path from 'node:path';

import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';

import { AppModule } from './app.module';
import { build } from './build';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors();
  app.useStaticAssets(path.resolve(import.meta.dir, '..', 'dist'));
  app.useStaticAssets(path.resolve(import.meta.dir, '..', 'public'));

  const configService = app.get(ConfigService);

  const isProduction = configService.get<string>('NODE_ENV') === 'production';
  const port = isProduction ? 80 : parseInt(configService.getOrThrow('GATEWAY_DEV_SERVER_PORT'));

  await app.listen(port);
  console.log(`Application is running on: ${await app.getUrl()}`);
}

await build();
void bootstrap();
