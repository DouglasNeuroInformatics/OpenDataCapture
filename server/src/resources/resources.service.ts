import fs from 'fs/promises';
import path from 'path';

import { Injectable } from '@nestjs/common';

@Injectable()
export class ResourcesService {
  private dataDir = path.join(__dirname, 'data');

  load(filename: string): Promise<string> {
    return fs.readFile(path.resolve(this.dataDir, filename), 'utf-8');
  }

  async loadAll(dir: string): Promise<string[]> {
    const filepaths = await fs.readdir(path.resolve(this.dataDir, dir));
    return Promise.all(filepaths.map((file) => fs.readFile(path.resolve(this.dataDir, dir, file), 'utf-8')));
  }
}
