import { renderToReadableStream } from 'react-dom/server';

import { Controller, Get, Header, Res, StreamableFile } from '@nestjs/common';
import { type Response } from 'express';

import { WebService } from './web.service';

@Controller()
export class WebController {
  // Until Bun implements metadata
  private readonly webService;

  constructor() {
    this.webService = new WebService();
  }

  @Get('*')
  @Header('Content-Type', 'text/html')
  async render() {
    const stream = await renderToReadableStream(this.webService.root(), {
      bootstrapScripts: ['/main.js']
    });
    const arrBuf = await Bun.readableStreamToArrayBuffer(stream);
    const buffer = Buffer.from(arrBuf);
    return new StreamableFile(buffer);
  }
}
