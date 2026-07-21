import { RuleTester } from 'eslint';
import rule from '../rules/prefer-lodash-chain.js';

// Wire RuleTester to vitest's test runner
RuleTester.describe = describe;
RuleTester.it = it;

const ruleTester = new RuleTester();

ruleTester.run('aberlaas/prefer-lodash-chain', rule, {
  valid: [
    {
      name: 'Accepts _.map(arr, fn) — single lodash call, no chain after',
      code: '_.map(arr, fn)',
    },
    {
      name: 'Accepts _.chain(arr).map(fn).value() — already using chain',
      code: '_.chain(arr).map(fn).value()',
    },
    {
      name: 'Accepts arr.map(fn).join(sep) — not a lodash call',
      code: 'arr.map(fn).join(sep)',
    },
    {
      name: 'Accepts _.isEmpty(x) — single lodash call, no chain',
      code: '_.isEmpty(x)',
    },
    {
      name: 'Does not flag _.map(arr, fn).length — property access, not method call',
      code: '_.map(arr, fn).length',
    },
  ],
  invalid: [
    {
      name: 'Flags _.map(arr, fn).join(sep) → _.chain(arr).map(fn).join(sep).value()',
      code: '_.map(arr, fn).join(sep)',
      output: '_.chain(arr).map(fn).join(sep).value()',
      errors: [{ messageId: 'preferChain' }],
    },
    {
      name: 'Flags _.filter(arr, pred).map(fn) → _.chain(arr).filter(pred).map(fn).value()',
      code: '_.filter(arr, pred).map(fn)',
      output: '_.chain(arr).filter(pred).map(fn).value()',
      errors: [{ messageId: 'preferChain' }],
    },
    {
      name: 'Flags _.map(arr, fn).filter(pred).join(sep) → _.chain(arr).map(fn).filter(pred).join(sep).value()',
      code: '_.map(arr, fn).filter(pred).join(sep)',
      output: '_.chain(arr).map(fn).filter(pred).join(sep).value()',
      errors: [{ messageId: 'preferChain' }],
    },
    {
      name: "Flags _.uniqueId().padStart(5, '0') → _.chain().uniqueId().padStart(5, '0').value()",
      code: "_.uniqueId().padStart(5, '0')",
      output: "_.chain().uniqueId().padStart(5, '0').value()",
      errors: [{ messageId: 'preferChain' }],
    },
    {
      name: 'Flags _.map(_.filter(arr, pred), fn) → _.chain(arr).filter(pred).map(fn).value()',
      code: '_.map(_.filter(arr, pred), fn)',
      output: '_.chain(arr).filter(pred).map(fn).value()',
      errors: [{ messageId: 'preferChain' }],
    },
    {
      name: 'Flags _.map(_.filter(_.sortBy(arr, sort), pred), fn) → _.chain(arr).sortBy(sort).filter(pred).map(fn).value()',
      code: '_.map(_.filter(_.sortBy(arr, sort), pred), fn)',
      output: '_.chain(arr).sortBy(sort).filter(pred).map(fn).value()',
      errors: [{ messageId: 'preferChain' }],
    },
    {
      name: 'Flags _.map(_.filter(arr, pred), fn).join(sep) → _.chain(arr).filter(pred).map(fn).join(sep).value()',
      code: '_.map(_.filter(arr, pred), fn).join(sep)',
      output: '_.chain(arr).filter(pred).map(fn).join(sep).value()',
      errors: [{ messageId: 'preferChain' }],
    },
  ],
});
