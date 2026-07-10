import { RuleTester } from 'eslint';
import rule from '../rules/test-file-naming.js';

// Wire RuleTester to vitest's test runner
RuleTester.describe = describe;
RuleTester.it = it;

const ruleTester = new RuleTester();

ruleTester.run('aberlaas/test-file-naming', rule, {
  valid: [
    {
      name: 'plain .js name',
      code: "it('works', () => {\n  expect(1).toBe(1);\n});\n",
      filename: '__tests__/pull.js',
    },
  ],
  invalid: [
    {
      name: '.test.js suffix',
      code: "it('works', () => {\n  expect(1).toBe(1);\n});\n",
      filename: '__tests__/pull.test.js',
      errors: [{ messageId: 'testFileSuffix' }],
    },
    {
      name: '.spec.js suffix',
      code: "it('works', () => {\n  expect(1).toBe(1);\n});\n",
      filename: '__tests__/pull.spec.js',
      errors: [{ messageId: 'testFileSuffix' }],
    },
    {
      name: '.test.js suffix outside __tests__/',
      code: "const foo = 'bar';\nalert(foo);\n",
      filename: 'lib/pull.test.js',
      errors: [{ messageId: 'testFileSuffix' }],
    },
  ],
});
