/**
 * Creates a CallExpression visitor that flags Object.<methodName>() and autofixes to _.<methodName>()
 * @param {string} methodName - The method name (e.g. 'keys', 'values', 'entries')
 * @param {import('eslint').Rule.RuleContext} context - ESLint rule context
 * @returns {import('eslint').Rule.RuleListener} Rule visitor object
 */
export function preferLodashMethod(methodName, context) {
  return {
    CallExpression(node) {
      const { callee } = node;
      if (callee.type !== 'MemberExpression') {
        return;
      }
      if (
        callee.object.type !== 'Identifier' ||
        callee.object.name !== 'Object'
      ) {
        return;
      }
      if (
        callee.property.type !== 'Identifier' ||
        callee.property.name !== methodName
      ) {
        return;
      }

      context.report({
        node,
        messageId: 'preferLodash',
        fix(fixer) {
          return fixer.replaceText(callee.object, '_');
        },
      });
    },
  };
}
