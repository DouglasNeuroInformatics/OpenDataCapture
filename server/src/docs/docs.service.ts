import fs from 'fs';
import path from 'path';

import { Injectable } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { OpenAPIObject, SwaggerModule } from '@nestjs/swagger';

import yaml from 'js-yaml';

@Injectable()
export class DocsService {
  private buildDir = path.join(__dirname, 'build');
  private resourcesDir = path.join(__dirname, 'resources');

  buildSpec(app: NestExpressApplication): void {
    const document = this.createDocument(app);

    if (!fs.existsSync(this.buildDir)) {
      fs.mkdirSync(this.buildDir);
    }

    const specFilepath = path.join(this.buildDir, 'api-spec.json');
    fs.writeFileSync(specFilepath, JSON.stringify(document, null, 2));
  }

  createDocument(app: NestExpressApplication): OpenAPIObject {
    const config = this.loadConfig();
    return SwaggerModule.createDocument(app, config);
  }

  private loadConfig(): Omit<OpenAPIObject, 'paths'> {
    return yaml.load(this.loadResourceAsTxt('swagger.config.yaml')) as Omit<OpenAPIObject, 'paths'>;
  }

  private loadResourceAsTxt(filename: string): string {
    return fs.readFileSync(path.join(this.resourcesDir, filename), 'utf-8');
  }
}
