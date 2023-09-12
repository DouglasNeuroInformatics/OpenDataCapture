import React from 'react';
import ReactDOM from 'react-dom/server';

import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  async main() {
    return ReactDOM.renderToStaticMarkup(this.render());
  }

  private render() {
    return (
      <html lang="en">
        <head>
          <meta charSet="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Open Data Capture</title>
        </head>
        <body>
          <h1>Hello World</h1>
        </body>
      </html>
    );
  }
}
