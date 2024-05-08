import path from 'node:path';

import { ValidationPipe } from '@douglasneuroinformatics/libnest/core';
import { type LogLevel, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { type NestExpressApplication } from '@nestjs/platform-express';
import { json } from 'express';

import { AppModule } from './app.module';
import { ConfigurationService } from './configuration/configuration.service';
import { setupDocs } from './docs';

async function bootstrap() {
  // This hacky type assertion is needed due to issue with linked dependency
  const app = (await NestFactory.create(AppModule)) as any as NestExpressApplication;

  const configurationService = app.get(ConfigurationService);
  const logLevels: LogLevel[] = ['error', 'fatal', 'log', 'warn'];
  if (configurationService.get('DEBUG')) {
    // eslint-disable-next-line no-console
    console.log("Enabled 'debug' logs");
    logLevels.push('debug');
  }
  if (configurationService.get('VERBOSE')) {
    // eslint-disable-next-line no-console
    console.log("Enabled 'verbose' logs");
    logLevels.push('verbose');
  }
  app.useLogger(logLevels);

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
  // eslint-disable-next-line no-console
  console.log(`Application is running on: ${await app.getUrl()}`);
}

void bootstrap();
