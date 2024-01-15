import path from 'node:path';

import { ExceptionsFilter, ValidationPipe } from '@douglasneuroinformatics/nestjs/core';
import { VersioningType } from '@nestjs/common';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { type NestExpressApplication } from '@nestjs/platform-express';
import { json } from 'express';

import { AppModule } from './app.module';
import { ConfigurationService } from './configuration/configuration.service';
import { setupDocs } from './docs';

async function bootstrap() {
  // Explicit type is needed due to issue with linked dependency
  const app: NestExpressApplication = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'debug', 'log', 'verbose']
  });

  app.enableCors();
  app.enableVersioning({
    defaultVersion: '1',
    type: VersioningType.URI
  });
  app.use(json({ limit: '50MB' }));
  app.useGlobalFilters(new ExceptionsFilter(app.get(HttpAdapterHost)));
  app.useGlobalPipes(new ValidationPipe());

  app.useStaticAssets(path.resolve(import.meta.dir, '..', 'public'));
  setupDocs(app);

  const configurationService = app.get(ConfigurationService);

  const isProduction = configurationService.get('NODE_ENV') === 'production';
  const port = isProduction ? 80 : configurationService.get('API_DEV_SERVER_PORT') ?? 5500;

  await app.listen(port);
  console.log(`Application is running on: ${await app.getUrl()}`);
}

void bootstrap();
