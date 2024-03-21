import path from 'node:path';
import url from 'url';

import { ValidationPipe } from '@douglasneuroinformatics/libnest/core';
import { type LogLevel, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { type NestExpressApplication } from '@nestjs/platform-express';
import { json } from 'express';

import { AppModule } from './app.module';
import { ConfigurationService } from './configuration/configuration.service';
import { setupDocs } from './docs';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function bootstrap() {
  // This hacky type assertion is needed due to issue with linked dependency
  const app = (await NestFactory.create(AppModule)) as any as NestExpressApplication;

  const configurationService = app.get(ConfigurationService);
  const logLevels: LogLevel[] = ['error', 'fatal', 'log', 'warn'];
  if (configurationService.get('DEBUG')) {
    console.log("Enabled 'debug' logs");
    logLevels.push('debug');
  }
  if (configurationService.get('VERBOSE')) {
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

  app.useStaticAssets(path.resolve(__dirname, '..', 'public'));
  setupDocs(app);

  const isProduction = configurationService.get('NODE_ENV') === 'production';
  const port = configurationService.get(isProduction ? 'API_PROD_SERVER_PORT' : 'API_DEV_SERVER_PORT');

  await app.listen(port);
  console.log(`Application is running on: ${await app.getUrl()}`);
}

void bootstrap();
