const methods = [
  { from: 'Object.keys', to: '_.keys' },
  { from: 'Object.values', to: '_.values' },
  { from: 'Object.entries', to: '_.entries' },
  { from: 'Array.isArray', to: '_.isArray' },
];

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Prefer lodash equivalents over native Object/Array static methods',
    },
    fixable: 'code',
    schema: [],
    messages: {
      preferLodash: 'Use `{{to}}()` instead of `{{from}}()`',
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
        if (callee.object.type !== 'Identifier') {
          return;
        }
        if (callee.property.type !== 'Identifier') {
          return;
        }

        const calleeName = `${callee.object.name}.${callee.property.name}`;

        const match = methods.find((m) => m.from === calleeName);
        if (!match) {
          return;
        }

        context.report({
          node,
          messageId: 'preferLodash',
          data: { from: match.from, to: match.to },
          fix(fixer) {
            return fixer.replaceText(callee.object, '_');
          },
        });
      },
    };
  },
};
