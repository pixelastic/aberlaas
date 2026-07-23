import ruleTester from '../../helpers/ruleTester.js';
import rule from '../prefer-lodash-values.js';

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
