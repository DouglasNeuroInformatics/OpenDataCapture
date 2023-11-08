import fs from 'fs/promises';
import path from 'path';

import { ValidationPipe } from '@douglasneuroinformatics/nestjs/core';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { type NestExpressApplication } from '@nestjs/platform-express';
import tailwindcssPlugin from 'bun-plugin-tailwindcss';

import { AppModule } from './app.module';
import { Layout } from './components/Layout';
import { RenderInterceptor } from './interceptors/render.interceptor';

const PROJECT_ROOT = path.resolve(import.meta.dir, '..');
const BUILD_DIR = path.resolve(PROJECT_ROOT, 'dist');

async function resolvePages() {
  const files = await fs.readdir(path.resolve(import.meta.dir, 'pages')).then((files) => {
    return files.map((filename) => path.resolve(import.meta.dir, 'pages', filename));
  });
  return files;
}

async function buildStaticContent() {
  await fs.rm(BUILD_DIR, { force: true, recursive: true });
  await fs.mkdir(BUILD_DIR);

  const pages = await resolvePages();
  console.log(pages);

  await Bun.build({
    entrypoints: [path.resolve(import.meta.dir, 'hydrate.tsx'), ...pages],
    minify: true,
    outdir: BUILD_DIR,
    plugins: [tailwindcssPlugin()],
    splitting: true,
    target: 'browser'
  });
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors();
  app.useGlobalInterceptors(
    new RenderInterceptor({
      root: Layout
    })
  );
  app.useGlobalPipes(new ValidationPipe());
  app.useStaticAssets(path.resolve(import.meta.dir, '..', 'dist'));
  app.useStaticAssets(path.resolve(import.meta.dir, '..', 'public'));

  const configService = app.get(ConfigService);

  const isProduction = configService.get<string>('NODE_ENV') === 'production';
  const port = isProduction ? 80 : parseInt(configService.getOrThrow('GATEWAY_DEV_SERVER_PORT'));

  await app.listen(port);
  console.log(`Application is running on: ${await app.getUrl()}`);
}

await buildStaticContent();
void bootstrap();
