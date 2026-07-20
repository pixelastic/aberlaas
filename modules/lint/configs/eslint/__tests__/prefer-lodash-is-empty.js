import { RuleTester } from 'eslint';
import rule from '../rules/prefer-lodash-is-empty.js';

// Wire RuleTester to vitest's test runner
RuleTester.describe = describe;
RuleTester.it = it;

const ruleTester = new RuleTester();

ruleTester.run('aberlaas/prefer-lodash-is-empty', rule, {
  valid: [
    {
      name: 'Accepts _.isEmpty(x) without error',
      code: '_.isEmpty(x)',
    },
    {
      name: 'Does not flag x.count === 0 (not .length)',
      code: 'x.count === 0',
    },
    {
      name: 'Does not flag x.length === 1 (not 0)',
      code: 'x.length === 1',
    },
    {
      name: 'Does not flag x.length < 1 (variant with 1)',
      code: 'x.length < 1',
    },
    {
      name: 'Does not flag 0 === x.length (Yoda condition)',
      code: '0 === x.length',
    },
  ],
  invalid: [
    {
      name: 'Flags x.length === 0 and fixes to _.isEmpty(x)',
      code: 'x.length === 0',
      output: '_.isEmpty(x)',
      errors: [{ messageId: 'preferIsEmpty' }],
    },
    {
      name: 'Flags x.length == 0 and fixes to _.isEmpty(x)',
      code: 'x.length == 0',
      output: '_.isEmpty(x)',
      errors: [{ messageId: 'preferIsEmpty' }],
    },
    {
      name: 'Flags x.length !== 0 and fixes to !_.isEmpty(x)',
      code: 'x.length !== 0',
      output: '!_.isEmpty(x)',
      errors: [{ messageId: 'preferIsEmpty' }],
    },
    {
      name: 'Flags x.length != 0 and fixes to !_.isEmpty(x)',
      code: 'x.length != 0',
      output: '!_.isEmpty(x)',
      errors: [{ messageId: 'preferIsEmpty' }],
    },
    {
      name: 'Flags x.length > 0 and fixes to !_.isEmpty(x)',
      code: 'x.length > 0',
      output: '!_.isEmpty(x)',
      errors: [{ messageId: 'preferIsEmpty' }],
    },
    {
      name: 'Flags foo.bar.length === 0 and fixes to _.isEmpty(foo.bar)',
      code: 'foo.bar.length === 0',
      output: '_.isEmpty(foo.bar)',
      errors: [{ messageId: 'preferIsEmpty' }],
    },
  ],
});
