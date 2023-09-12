import { Controller, Get } from '@nestjs/common';

@Controller({ path: 'forms' })
export class FormsController {
  @Get()
  forms() {
    return 'forms';
  }
}
