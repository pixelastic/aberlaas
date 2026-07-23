import ruleTester from '../../helpers/ruleTester.js';
import rule from '../private-methods-no-wrapper.js';

ruleTester.run('aberlaas/private-methods-no-wrapper', rule, {
  valid: [
    {
      name: 'Multi-statement body is not flagged',
      code: '__ = { fetch(url) { console.log(url); return fetch(url); } };',
    },
    {
      name: 'Value-to-function adapter is not flagged',
      code: '__ = { getDefault: () => defaultValue };',
    },
    {
      name: 'Properties outside __ = { ... } are not flagged',
      code: 'const obj = { fetch(url) { return fetch(url); } };',
    },
    {
      name: 'Shorthand property is not flagged',
      code: '__ = { fetch };',
    },
    {
      name: 'Non-wrapper arrow (different args) is not flagged',
      code: '__ = { fetch: (url, opts) => fetch(url) };',
    },
  ],
  invalid: [
    {
      name: 'Method syntax wrapper autofixes to shorthand',
      code: '__ = { fetch(url) { return fetch(url); } };',
      output: '__ = { fetch };',
      errors: [{ messageId: 'noWrapper', data: { calleeName: 'fetch' } }],
    },
    {
      name: 'Arrow syntax wrapper autofixes to shorthand',
      code: '__ = { fetch: (url) => fetch(url) };',
      output: '__ = { fetch };',
      errors: [{ messageId: 'noWrapper', data: { calleeName: 'fetch' } }],
    },
    {
      name: 'Async method wrapper autofixes to shorthand',
      code: '__ = { async fetch(url) { return fetch(url); } };',
      output: '__ = { fetch };',
      errors: [{ messageId: 'noWrapper', data: { calleeName: 'fetch' } }],
    },
    {
      name: 'return await wrapper autofixes to shorthand',
      code: '__ = { async fetch(url) { return await fetch(url); } };',
      output: '__ = { fetch };',
      errors: [{ messageId: 'noWrapper', data: { calleeName: 'fetch' } }],
    },
    {
      name: 'Zero-param wrapper autofixes to shorthand',
      code: '__ = { init() { return init(); } };',
      output: '__ = { init };',
      errors: [{ messageId: 'noWrapper', data: { calleeName: 'init' } }],
    },
    {
      name: 'Async arrow wrapper autofixes to shorthand',
      code: '__ = { fetch: async (url) => fetch(url) };',
      output: '__ = { fetch };',
      errors: [{ messageId: 'noWrapper', data: { calleeName: 'fetch' } }],
    },
    {
      name: 'Async arrow with await expression body autofixes to shorthand',
      code: '__ = { fetch: async (url) => await fetch(url) };',
      output: '__ = { fetch };',
      errors: [{ messageId: 'noWrapper', data: { calleeName: 'fetch' } }],
    },
    {
      name: 'Different-name method wrapper reports correct message, no autofix',
      code: '__ = { getData(url) { return fetch(url); } };',
      output: null,
      errors: [{ messageId: 'noWrapper', data: { calleeName: 'fetch' } }],
    },
    {
      name: 'Different-name arrow wrapper reports correct message, no autofix',
      code: '__ = { getData: (url) => fetch(url) };',
      output: null,
      errors: [{ messageId: 'noWrapper', data: { calleeName: 'fetch' } }],
    },
  ],
});
