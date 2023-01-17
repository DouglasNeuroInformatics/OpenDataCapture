import cp from 'child_process';
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

  private docsFilepath = path.join(this.buildDir, 'index.html');
  private specFilepath = path.join(this.buildDir, 'api-spec.json');

  buildSpec(app: NestExpressApplication): void {
    const document = this.createDocument(app);

    if (!fs.existsSync(this.buildDir)) {
      fs.mkdirSync(this.buildDir);
    }

    fs.writeFileSync(this.specFilepath, JSON.stringify(document, null, 2));
  }

  buildDocs(): void {
    cp.execSync(`redocly build-docs ${this.specFilepath} -o ${this.docsFilepath}`);
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
