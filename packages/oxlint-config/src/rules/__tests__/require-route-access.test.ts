import { requireRouteAccess } from '../require-route-access.js';
import { ruleTester } from './rule-tester.js';

ruleTester.run('require-route-access', requireRouteAccess, {
  invalid: [
    { code: 'class C {\n  @Get()\n  find() {}\n}', errors: [{ line: 2, messageId: 'routeAccess' }] },
    { code: 'class C {\n  @Delete(":id")\n  @HttpCode(204)\n  remove() {}\n}', errors: [{ messageId: 'routeAccess' }] },
    { code: 'class C {\n  @Post()\n  @Auth.RouteAccess([])\n  create() {}\n}', errors: [{ messageId: 'routeAccess' }] },
    { code: 'class C {\n  @Patch()\n  a() {}\n  @Put()\n  b() {}\n}', errors: 2 }
  ],
  valid: [
    'class C {\n  @Get()\n  @RouteAccess({ action: "read", subject: "User" })\n  find() {}\n}',
    'class C {\n  @RouteAccess([])\n  @Post()\n  create() {}\n}',
    'class C {\n  @Head()\n  check() {}\n}',
    'class C {\n  @Get\n  find() {}\n}',
    'class C {\n  helper() {}\n}'
  ]
});
