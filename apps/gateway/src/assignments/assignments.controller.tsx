import { Controller, Get } from '@nestjs/common';

import { Page } from '../decorators/page.decorator';
import IndexPage from '../pages';

@Controller()
export class AssignmentsController {
  @Get()
  @Page()
  render() {
    return <IndexPage />;
  }
}
