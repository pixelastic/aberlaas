import { preferLodashMethod } from './helpers/prefer-lodash-method.js';

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Prefer `_.entries()` over `Object.entries()`',
    },
    fixable: 'code',
    schema: [],
    messages: {
      preferLodash: 'Use `_.entries()` instead of `Object.entries()`',
    },
  },
  /**
   * @param {import('eslint').Rule.RuleContext} context - ESLint rule context
   * @returns {import('eslint').Rule.RuleListener} Rule visitor object
   */
  create(context) {
    return preferLodashMethod('entries', context);
  },
};
