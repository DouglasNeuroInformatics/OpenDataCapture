const ROUTE_EXPORT = 'Route';

const exportedName = (node) => (node.type === 'Identifier' ? node.name : String(node.value));

/** @type {import('eslint').Rule.RuleModule} */
export const routeExports = {
  create(context) {
    return {
      ExportAllDeclaration(node) {
        context.report({ messageId: 'route', node });
      },
      ExportDefaultDeclaration(node) {
        context.report({ messageId: 'route', node });
      },
      ExportNamedDeclaration(node) {
        const { declaration, specifiers } = node;
        if (declaration && declaration.type !== 'VariableDeclaration') {
          context.report({ messageId: 'route', node: declaration });
          return;
        }
        for (const { id } of declaration?.declarations ?? []) {
          if (id.type !== 'Identifier' || id.name !== ROUTE_EXPORT) {
            context.report({ messageId: 'route', node: id });
          }
        }
        for (const { exported } of specifiers) {
          if (exportedName(exported) !== ROUTE_EXPORT) {
            context.report({ messageId: 'route', node: exported });
          }
        }
      }
    };
  },
  meta: {
    messages: {
      route:
        'A route file exports nothing but `Route`. The router plugin code-splits only the route itself, so any other export is bundled eagerly and couples its importers to the route.'
    },
    schema: [],
    type: 'problem'
  }
};
