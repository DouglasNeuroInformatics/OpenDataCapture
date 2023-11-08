import { Controller, Get } from '@nestjs/common';

import { Render } from '@/decorators/render.decorator';

import { Page } from '../decorators/page.decorator';
import IndexPage from '../pages';

@Controller()
export class AssignmentsController {
  @Get()
  @Page()
  @Render(IndexPage)
  render() {
    return {};
  }
}
