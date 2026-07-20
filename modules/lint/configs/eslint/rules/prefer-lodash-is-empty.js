export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Prefer `_.isEmpty()` over `.length` comparisons to `0`',
    },
    fixable: 'code',
    schema: [],
    messages: {
      preferIsEmpty: 'Use `_.isEmpty()` instead of `.length` comparison',
    },
  },
  /**
   * @param {import('eslint').Rule.RuleContext} context - ESLint rule context
   * @returns {import('eslint').Rule.RuleListener} Rule visitor object
   */
  create(context) {
    return {
      BinaryExpression(node) {
        const { left, right, operator } = node;

        // Only match .length on the left side (no Yoda)
        if (
          left.type !== 'MemberExpression' ||
          left.property.type !== 'Identifier' ||
          left.property.name !== 'length'
        ) {
          return;
        }

        // Right side must be literal 0
        if (right.type !== 'Literal' || right.value !== 0) {
          return;
        }

        // Only match these operators
        const emptyOperators = ['===', '=='];
        const notEmptyOperators = ['!==', '!=', '>'];
        if (
          !emptyOperators.includes(operator) &&
          !notEmptyOperators.includes(operator)
        ) {
          return;
        }

        const sourceCode = context.sourceCode || context.getSourceCode();
        const objectText = sourceCode.getText(left.object);
        const isEmpty = emptyOperators.includes(operator);
        const fix = isEmpty
          ? `_.isEmpty(${objectText})`
          : `!_.isEmpty(${objectText})`;

        context.report({
          node,
          messageId: 'preferIsEmpty',
          fix(fixer) {
            return fixer.replaceText(node, fix);
          },
        });
      },
    };
  },
};
