import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { Controller, Get } from '@nestjs/common';

@Controller()
export class WebController {
  @Get('*')
  render() {
    return renderToStaticMarkup(
      <html lang="en">
        <head>
          <meta charSet="UTF-8" />
          <link href="/favicon.ico" rel="icon" type="image/svg+xml" />
          <meta content="width=device-width, initial-scale=1.0" name="viewport" />
          <title>Open Data Capture</title>
          <link href="main.css" rel="stylesheet" />
        </head>
        <body className="bg-slate-100 text-slate-900 dark:bg-slate-900 dark:text-slate-100">
          <h1>Hello World</h1>
        </body>
      </html>
    );
  }
}
