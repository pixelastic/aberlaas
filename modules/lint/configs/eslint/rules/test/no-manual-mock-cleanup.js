const bannedMethods = new Set([
  'restoreAllMocks',
  'clearAllMocks',
  'resetAllMocks',
]);

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Disallow redundant vi.restoreAllMocks/clearAllMocks/resetAllMocks calls',
    },
    schema: [],
    messages: {
      restoreAllMocks:
        'No need to manually restore mocks, vitest is already configured with restoreMocks: true',
      clearAllMocks:
        'No need to manually clear mocks, vitest is already configured with clearMocks: true',
      resetAllMocks:
        'No need to manually reset mocks, vitest is already configured with restoreMocks: true',
    },
  },
  /**
   * @param {import('eslint').Rule.RuleContext} context - ESLint rule context
   * @returns {import('eslint').Rule.RuleListener} Rule visitor object
   */
  create(context) {
    return {
      CallExpression(node) {
        const { callee } = node;
        if (callee.type !== 'MemberExpression') {
          return;
        }
        if (callee.object.name !== 'vi') {
          return;
        }
        const methodName = callee.property.name;
        if (!bannedMethods.has(methodName)) {
          return;
        }
        context.report({
          node,
          messageId: methodName,
        });
      },
    };
  },
};
