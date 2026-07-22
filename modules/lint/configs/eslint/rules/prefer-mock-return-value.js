const bannedMethods = new Map([
  ['mockResolvedValue', 'mockReturnValue'],
  ['mockResolvedValueOnce', 'mockReturnValueOnce'],
  ['mockRejectedValue', 'mockReturnValue'],
  ['mockRejectedValueOnce', 'mockReturnValueOnce'],
]);

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Prefer `mockReturnValue` over `mockResolvedValue`/`mockRejectedValue`',
    },
    fixable: 'code',
    schema: [],
    messages: {
      preferMockReturnValue: 'Use mockReturnValue() instead',
      preferMockReturnValueOnce: 'Use mockReturnValueOnce() instead',
    },
  },
  /**
   * @param {import('eslint').Rule.RuleContext} context - ESLint rule context
   * @returns {import('eslint').Rule.RuleListener} Rule visitor object
   */
  create(context) {
    return {
      MemberExpression(node) {
        if (node.property.type !== 'Identifier') {
          return;
        }

        const replacement = bannedMethods.get(node.property.name);
        if (!replacement) {
          return;
        }

        const isOnce = replacement === 'mockReturnValueOnce';
        context.report({
          node: node.property,
          messageId: isOnce
            ? 'preferMockReturnValueOnce'
            : 'preferMockReturnValue',
          fix(fixer) {
            return fixer.replaceText(node.property, replacement);
          },
        });
      },
    };
  },
};
