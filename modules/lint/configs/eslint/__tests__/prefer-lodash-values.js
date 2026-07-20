import { RuleTester } from 'eslint';
import rule from '../rules/prefer-lodash-values.js';

// Wire RuleTester to vitest's test runner
RuleTester.describe = describe;
RuleTester.it = it;

const ruleTester = new RuleTester();

ruleTester.run('aberlaas/prefer-lodash-values', rule, {
  valid: [
    {
      name: 'Accepts _.values(foo)',
      code: '_.values(foo)',
    },
  ],
  invalid: [
    {
      name: 'Flags Object.values(foo) and fixes to _.values(foo)',
      code: 'Object.values(foo)',
      output: '_.values(foo)',
      errors: [{ messageId: 'preferLodash' }],
    },
  ],
});
