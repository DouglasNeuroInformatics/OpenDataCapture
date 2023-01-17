import cp from 'child_process';
import fs from 'fs';
import path from 'path';

import { Injectable } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { OpenAPIObject, SwaggerModule } from '@nestjs/swagger';

import yaml from 'js-yaml';

import { ResourcesService } from '@/resources/resources.service';

@Injectable()
export class DocsService {
  private buildDir = path.join(__dirname, 'build');

  private docsFilepath = path.join(this.buildDir, 'index.html');
  private specFilepath = path.join(this.buildDir, 'api-spec.json');

  constructor(private readonly resourcesService: ResourcesService) {}

  async buildSpec(app: NestExpressApplication): Promise<void> {
    const document = await this.createDocument(app);

    if (!fs.existsSync(this.buildDir)) {
      fs.mkdirSync(this.buildDir);
    }

    fs.writeFileSync(this.specFilepath, JSON.stringify(document, null, 2));
  }

  buildDocs(): void {
    cp.execSync(`redocly build-docs ${this.specFilepath} -o ${this.docsFilepath}`);
  }

  async createDocument(app: NestExpressApplication): Promise<OpenAPIObject> {
    const config = await this.loadConfig();
    return SwaggerModule.createDocument(app, config);
  }

  private async loadConfig(): Promise<Omit<OpenAPIObject, 'paths'>> {
    const contents = await this.resourcesService.load('docs/swagger.config.yaml');
    return yaml.load(contents) as Omit<OpenAPIObject, 'paths'>;
  }
}
