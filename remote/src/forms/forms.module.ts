import { Module } from '@nestjs/common';

import { FormsController } from './forms.controller';

@Module({
  controllers: [FormsController]
})
export class FormsModule {}
