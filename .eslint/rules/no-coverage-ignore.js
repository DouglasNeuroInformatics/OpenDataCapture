const COVERAGE_IGNORE = /^[\s*]*(?:c8|istanbul|v8)\s+ignore(?:\s|$)/u;

/** @type {import('eslint').Rule.RuleModule} */
export const noCoverageIgnore = {
  create(context) {
    return {
      Program() {
        for (const { loc, value } of context.sourceCode.getAllComments()) {
          if (COVERAGE_IGNORE.test(value)) {
            context.report({ loc, messageId: 'coverageIgnore' });
          }
        }
      }
    };
  },
  meta: {
    messages: {
      coverageIgnore:
        'Coverage stays at 100% with no exclusions: test this code, or prove it unreachable and delete it.'
    },
    schema: [],
    type: 'problem'
  }
};
