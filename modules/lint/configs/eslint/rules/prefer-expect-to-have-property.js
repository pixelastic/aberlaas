export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Prefer `toHaveProperty` over dot-access in `expect()`',
    },
    fixable: 'code',
    schema: [],
    messages: {
      preferToHaveProperty:
        'Use `toHaveProperty` instead of dot-access in `expect()`',
    },
  },
  /**
   * @param {import('eslint').Rule.RuleContext} context - ESLint rule context
   * @returns {import('eslint').Rule.RuleListener} Rule visitor object
   */
  create(context) {
    return {
      CallExpression(node) {
        // Match: expect(a.foo).<matcher>(bar)
        // Shape: CallExpression[callee=MemberExpression]
        //   callee.object = CallExpression (the expect() call)
        //   callee.property = Identifier (toEqual, toBe, toBeDefined)
        const handledMatchers = new Set(['toEqual', 'toBe', 'toBeDefined']);

        if (
          node.callee.type !== 'MemberExpression' ||
          node.callee.property.type !== 'Identifier' ||
          !handledMatchers.has(node.callee.property.name)
        ) {
          return;
        }

        const matcherName = node.callee.property.name;

        const expectCall = node.callee.object;

        // Must be expect(...) direct call — skip .not chains
        if (
          expectCall.type !== 'CallExpression' ||
          expectCall.callee.type !== 'Identifier' ||
          expectCall.callee.name !== 'expect'
        ) {
          return;
        }

        // expect() must have exactly one argument
        if (expectCall.arguments.length !== 1) {
          return;
        }

        const arg = expectCall.arguments[0];

        // Argument must be a member expression (a.foo)
        if (
          arg.type !== 'MemberExpression' ||
          arg.computed ||
          arg.property.type !== 'Identifier'
        ) {
          return;
        }

        const sourceCode = context.sourceCode || context.getSourceCode();
        const objectText = sourceCode.getText(arg.object);
        const propertyName = arg.property.name;

        // toBeDefined → no value argument; toBe/toEqual → pass value through
        const valuePart =
          matcherName === 'toBeDefined'
            ? ''
            : `, ${node.arguments.map((a) => sourceCode.getText(a)).join(', ')}`;

        context.report({
          node,
          messageId: 'preferToHaveProperty',
          fix(fixer) {
            return fixer.replaceText(
              node,
              `expect(${objectText}).toHaveProperty('${propertyName}'${valuePart})`,
            );
          },
        });
      },
    };
  },
};
