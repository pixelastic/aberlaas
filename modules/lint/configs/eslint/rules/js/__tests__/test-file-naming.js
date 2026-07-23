import ruleTester from '../../helpers/ruleTester.js';
import rule from '../test-file-naming.js';

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
