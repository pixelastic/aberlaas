import ruleTester from '../../helpers/ruleTester.js';
import rule from '../prefer-lodash-entries.js';

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
