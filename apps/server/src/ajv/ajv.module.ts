import { Module } from '@nestjs/common';

import { AjvService } from './ajv.service';

@Module({
  providers: [AjvService],
  exports: [AjvService]
})
export class AjvModule {}
