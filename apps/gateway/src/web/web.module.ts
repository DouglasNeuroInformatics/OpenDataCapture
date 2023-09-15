import { Module } from '@nestjs/common';

import { WebController } from './web.controller';

@Module({
  controllers: [WebController]
})
export class WebModule {}
