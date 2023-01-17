import path from 'path';

import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';

import { DocsService } from './docs.service';

import { ResourcesModule } from '@/resources/resources.module';

@Module({
  imports: [
    ResourcesModule,
    ServeStaticModule.forRoot({
      rootPath: path.join(__dirname, 'build')
    })
  ],
  providers: [DocsService],
  exports: [DocsService]
})
export class DocsModule {}
