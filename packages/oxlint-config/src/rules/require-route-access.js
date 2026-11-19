/** @import { CreateRule } from '@oxlint/plugins' */

const UNGUARDED_HANDLER =
  'MethodDefinition:has(Decorator > CallExpression > Identifier.callee[name=/^(Delete|Get|Patch|Post|Put)$/]):not(:has(Decorator > CallExpression > Identifier.callee[name="RouteAccess"]))';

/** @type {CreateRule} */
export const requireRouteAccess = {
  create(context) {
    return {
      [UNGUARDED_HANDLER](node) {
        context.report({ messageId: 'routeAccess', node });
      }
    };
  },
  meta: {
    messages: {
      routeAccess:
        'Every controller handler needs @RouteAccess. Without it JwtAuthGuard throws InternalServerErrorException at request time. Note that @RouteAccess([]) grants access to any authenticated user.'
    },
    schema: [],
    type: 'problem'
  }
};
