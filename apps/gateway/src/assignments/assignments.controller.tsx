import { Controller, Get } from '@nestjs/common';

import { Render } from '@/decorators/render.decorator';

import IndexPage from '../pages';

@Controller()
export class AssignmentsController {
  @Get()
  @Render(IndexPage)
  render() {
    return {}; // { title: 'My Page' };
  }
}
