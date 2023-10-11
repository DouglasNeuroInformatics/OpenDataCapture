import { renderToReadableStream } from 'react-dom/server';

import { Controller, Get, Header, StreamableFile } from '@nestjs/common';

import IndexPage from './pages';

@Controller()
export class AppController {
  @Get()
  @Header('Content-Type', 'text/html')
  async render() {
    const stream = await renderToReadableStream(<IndexPage />, {
      bootstrapModules: ['/hydrate.js']
    });
    const arrBuf = await Bun.readableStreamToArrayBuffer(stream);
    const buffer = Buffer.from(arrBuf);
    return new StreamableFile(buffer);
  }
}
