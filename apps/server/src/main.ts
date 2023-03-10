import { VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { Command } from 'commander';

import { AppModule } from './app.module';
import { DatabaseService } from './database/database.service';
import { UsersService } from './users/users.service';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableCors();
  app.enableVersioning({
    defaultVersion: '1',
    type: VersioningType.URI
  });
  app.setGlobalPrefix('/api');

  const documentBuilder = new DocumentBuilder()
    .setTitle('The Douglas Data Capture Platform')
    .setContact('Joshua Unrau', '', 'joshua.unrau@mail.mcgill.ca')
    .setDescription('Documentation for the REST API for Douglas Data Capture Platform')
    .setLicense('AGPL-3.0', 'https://www.gnu.org/licenses/agpl-3.0.txt')
    .setVersion('1')
    .setExternalDoc(
      'Additional Technical Documentation',
      'https://douglasneuroinformatics.github.io/DouglasDataCapturePlatform/#/'
    )
    .addTag('Authentication')
    .addTag(
      'Users',
      "The following methods for adding, modifying, and deleting users are exclusively available to 'system-admin' users. As a result, they are not implemented in our web app and can only be accessed through programmatic use."
    )
    .build();

  const document = SwaggerModule.createDocument(app, documentBuilder);
  SwaggerModule.setup('api', app, document);

  const configService = app.get(ConfigService);
  const port = configService.getOrThrow<number>('SERVER_PORT');

  await app.listen(port);
  console.log(`Application is running on: ${await app.getUrl()}`);
}

async function setup(username: string, password: string): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  await app.get(DatabaseService).purgeDb();
  await app.get(UsersService).create({ username, password, isAdmin: true });
  await app.close();
}

const program = new Command();

program
  .command('run')
  .description('run the application')
  .action(() => {
    void bootstrap();
  });

program
  .command('setup')
  .description('setup the application with an admin account')
  .requiredOption('--username <string>', 'the username for the first admin')
  .requiredOption('--password <string>', 'the password for the first admin')
  .action(({ username, password }: Record<string, string>) => {
    void setup(username, password);
  });

program.parse();
