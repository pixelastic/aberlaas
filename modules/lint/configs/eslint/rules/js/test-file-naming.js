import path from 'node:path';

export default {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow .test. or .spec. suffix in filenames. Name test files after the module they test, in __tests__',
    },
    schema: [],
    messages: {
      testFileSuffix:
        '"{{ filename }}" should be renamed to "{{ correctName }}"',
    },
  },
  /**
   * @param {import('eslint').Rule.RuleContext} context - ESLint rule context
   * @returns {import('eslint').Rule.RuleListener} Rule visitor object
   */
  create(context) {
    return {
      Program(node) {
        const filename = path.basename(context.filename);
        if (!filename.includes('.test.') && !filename.includes('.spec.')) {
          return;
        }
        const correctName = `__tests__/${filename.replace(/\.(test|spec)\./u, '.')}`;
        context.report({
          node,
          messageId: 'testFileSuffix',
          data: { filename, correctName },
        });
      },
    };
  },
};
