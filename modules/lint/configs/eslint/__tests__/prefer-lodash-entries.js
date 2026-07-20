import { RuleTester } from 'eslint';
import rule from '../rules/prefer-lodash-entries.js';

// Wire RuleTester to vitest's test runner
RuleTester.describe = describe;
RuleTester.it = it;

const ruleTester = new RuleTester();

ruleTester.run('aberlaas/prefer-lodash-entries', rule, {
  valid: [
    {
      name: 'Accepts _.entries(foo)',
      code: '_.entries(foo)',
    },
  ],
  invalid: [
    {
      name: 'Flags Object.entries(foo) and fixes to _.entries(foo)',
      code: 'Object.entries(foo)',
      output: '_.entries(foo)',
      errors: [{ messageId: 'preferLodash' }],
    },
  ],
});
