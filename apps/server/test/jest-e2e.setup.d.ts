import { type NestExpressApplication } from '@nestjs/platform-express';
import { type OpenAPIObject } from '@nestjs/swagger';

import { type Connection } from 'mongoose';

declare global {
  declare const TestSetup: {
    app: NestExpressApplication;
    db: Connection;
    server: any;
    spec: OpenAPIObject;
  };
}
