import { RuleTester } from 'eslint';
import rule from '../rules/prefer-lodash-keys.js';

// Wire RuleTester to vitest's test runner
RuleTester.describe = describe;
RuleTester.it = it;

const ruleTester = new RuleTester();

ruleTester.run('aberlaas/prefer-lodash-keys', rule, {
  valid: [
    {
      name: 'Accepts _.keys(foo)',
      code: '_.keys(foo)',
    },
    {
      name: 'Does not flag unrelated Object methods like Object.freeze',
      code: 'Object.freeze(foo)',
    },
  ],
  invalid: [
    {
      name: 'Flags Object.keys(foo) and fixes to _.keys(foo)',
      code: 'Object.keys(foo)',
      output: '_.keys(foo)',
      errors: [{ messageId: 'preferLodash' }],
    },
    {
      name: 'Flags Object.keys(foo.bar) with nested argument',
      code: 'Object.keys(foo.bar)',
      output: '_.keys(foo.bar)',
      errors: [{ messageId: 'preferLodash' }],
    },
  ],
});
