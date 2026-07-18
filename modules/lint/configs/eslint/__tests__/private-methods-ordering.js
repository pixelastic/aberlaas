import { RuleTester } from 'eslint';
import rule from '../rules/private-methods-ordering.js';

// Wire RuleTester to vitest's test runner
RuleTester.describe = describe;
RuleTester.it = it;

const ruleTester = new RuleTester();

ruleTester.run('aberlaas/private-methods-ordering', rule, {
  valid: [
    {
      name: 'Already correct order (methods first, shorthands last)',
      code: '__ = { fetch(url) { return fetch(url); }, init };',
    },
    {
      name: 'All non-shorthand properties',
      code: '__ = { fetch(url) { return fetch(url); }, save: () => save() };',
    },
    {
      name: 'All shorthand properties',
      code: '__ = { fetch, init, save };',
    },
    {
      name: 'Properties outside __ = { ... } are not flagged',
      code: 'const obj = { init, fetch(url) { return fetch(url); } };',
    },
  ],
  invalid: [
    {
      name: 'Single shorthand before a method autofixes to correct order',
      code: '__ = { init, fetch(url) { return fetch(url); } };',
      output: '__ = { fetch(url) { return fetch(url); }, init };',
      errors: [{ messageId: 'ordering' }],
    },
    {
      name: 'Multiple mixed shorthands preserve relative order within each group',
      code: '__ = { alpha, fetch(url) { return fetch(url); }, beta, save: () => save() };',
      output:
        '__ = { fetch(url) { return fetch(url); }, save: () => save(), alpha, beta };',
      errors: [{ messageId: 'ordering' }],
    },
  ],
});
