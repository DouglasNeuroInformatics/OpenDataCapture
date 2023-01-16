import path from 'path';

import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';

import { DocsService } from './docs.service';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: path.join(__dirname, 'build')
    })
  ],
  providers: [DocsService],
  exports: [DocsService]
})
export class DocsModule {}
