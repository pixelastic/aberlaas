import { _ } from 'golgoth';

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

        // Argument must be a member expression
        if (arg.type !== 'MemberExpression') {
          return;
        }

        // Walk the member expression chain to extract segments
        const segments = [];
        let current = arg;
        while (current.type === 'MemberExpression') {
          if (current.computed) {
            // a[key] or a['foo']
            if (current.property.type === 'Literal') {
              segments.unshift({
                type: 'static',
                value: current.property.value,
              });
            } else if (current.property.type === 'Identifier') {
              segments.unshift({
                type: 'computed',
                value: current.property.name,
              });
            } else {
              return;
            }
          } else if (current.property.type === 'Identifier') {
            // a.foo
            segments.unshift({ type: 'static', value: current.property.name });
          } else {
            return;
          }
          current = current.object;
        }

        if (_.isEmpty(segments)) {
          return;
        }

        const sourceCode = context.sourceCode || context.getSourceCode();
        const objectText = sourceCode.getText(current);
        const hasComputed = segments.some((s) => s.type === 'computed');

        // Build property path argument
        let propertyArg;
        if (hasComputed && segments.length === 1) {
          // Single computed variable: key
          propertyArg = segments[0].value;
        } else if (hasComputed) {
          // Array format: [key, 'foo']
          const items = segments.map((s) =>
            s.type === 'computed' ? s.value : `'${s.value}'`,
          );
          propertyArg = `[${items.join(', ')}]`;
        } else {
          // String format: 'foo.bar'
          propertyArg = `'${segments.map((s) => s.value).join('.')}'`;
        }

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
              `expect(${objectText}).toHaveProperty(${propertyArg}${valuePart})`,
            );
          },
        });
      },
    };
  },
};
