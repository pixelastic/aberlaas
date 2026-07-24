import ruleTester from '../../helpers/ruleTester.js';
import rule from '../private-methods-no-jsdoc-on-proxy.js';

ruleTester.run('aberlaas/private-methods-no-jsdoc-on-proxy', rule, {
  valid: [
    {
      name: 'Shorthand proxy without any comment',
      code: '__ = { fetch };',
    },
    {
      name: 'Shorthand proxy with plain comment (no @tag)',
      code: '__ = { /** explanation */ fetch };',
    },
    {
      name: 'Shorthand proxy with line comment',
      code: '__ = { // delegates to fetch\nfetch };',
    },
    {
      name: 'Non-shorthand method with JSDoc is allowed',
      code: '__ = { /** @param {string} url */ fetch(url) { return fetch(url); } };',
    },
    {
      name: 'Non-shorthand arrow with JSDoc is allowed',
      code: '__ = { /** @param {string} url */ fetch: (url) => fetch(url) };',
    },
    {
      name: '@ mid-line is not a tag',
      code: '__ = { /** Given by @someone */ fetch };',
    },
  ],
  invalid: [
    {
      name: 'Single-line JSDoc with @param on shorthand proxy',
      code: '__ = { /** @param {string} name */ fetch };',
      output: '__ = { fetch };',
      errors: [{ messageId: 'noJsdocOnProxy' }],
    },
    {
      name: 'Multi-line JSDoc with @returns on shorthand proxy',
      code: `__ = {
  /**
   * @returns {boolean}
   */
  fetch
};`,
      output: `__ = {
  fetch
};`,
      errors: [{ messageId: 'noJsdocOnProxy' }],
    },
  ],
});
