import fs from 'fs/promises';
import path from 'path';

import { Injectable } from '@nestjs/common';

@Injectable()
export class ResourcesService {
  private dataDir = path.join(__dirname, 'data');

  load(filename: string): Promise<string> {
    return fs.readFile(path.resolve(this.dataDir, filename), 'utf-8');
  }
}
