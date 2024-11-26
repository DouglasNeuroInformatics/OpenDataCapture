import path from 'node:path';

import { ValidationPipe } from '@douglasneuroinformatics/libnest/core';
import { JSONLogger } from '@douglasneuroinformatics/libnest/logging';
import { VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { json } from 'express';

import { AppModule } from './app.module';
import { ConfigurationService } from './configuration/configuration.service';
import { setupDocs } from './docs';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: false
  });
  app.enableShutdownHooks();

  const configurationService = app.get(ConfigurationService);

  const logger = new JSONLogger(null, {
    debug: configurationService.get('DEBUG'),
    verbose: configurationService.get('VERBOSE')
  });

  app.useLogger(logger);

  app.enableCors();
  app.enableVersioning({
    defaultVersion: '1',
    type: VersioningType.URI
  });
  app.use(json({ limit: '50MB' }));
  app.useGlobalPipes(new ValidationPipe());

  app.useStaticAssets(path.resolve(import.meta.dirname, '..', 'public'));
  setupDocs(app);

  const isProduction = configurationService.get('NODE_ENV') === 'production';
  const port = configurationService.get(isProduction ? 'API_PROD_SERVER_PORT' : 'API_DEV_SERVER_PORT');

  await app.listen(port);

  logger.log(`Application is running on: ${await app.getUrl()}`);
}

void bootstrap();
