import ruleTester from '../../helpers/ruleTester.js';
import rule from '../prefer-lodash-methods.js';

ruleTester.run('aberlaas/prefer-lodash-methods', rule, {
  valid: [
    {
      name: 'Accepts _.keys(foo)',
      code: '_.keys(foo)',
    },
    {
      name: 'Does not flag unrelated Object methods like Object.freeze',
      code: 'Object.freeze(foo)',
    },
    {
      name: 'Accepts _.values(foo)',
      code: '_.values(foo)',
    },
    {
      name: 'Accepts _.entries(foo)',
      code: '_.entries(foo)',
    },
    {
      name: 'Accepts _.isArray(foo)',
      code: '_.isArray(foo)',
    },
    {
      name: 'Does not flag Array.from(foo)',
      code: 'Array.from(foo)',
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
    {
      name: 'Flags Object.values(foo) and fixes to _.values(foo)',
      code: 'Object.values(foo)',
      output: '_.values(foo)',
      errors: [{ messageId: 'preferLodash' }],
    },
    {
      name: 'Flags Object.entries(foo) and fixes to _.entries(foo)',
      code: 'Object.entries(foo)',
      output: '_.entries(foo)',
      errors: [{ messageId: 'preferLodash' }],
    },
    {
      name: 'Flags Array.isArray(foo) and fixes to _.isArray(foo)',
      code: 'Array.isArray(foo)',
      output: '_.isArray(foo)',
      errors: [{ messageId: 'preferLodash' }],
    },
  ],
});
