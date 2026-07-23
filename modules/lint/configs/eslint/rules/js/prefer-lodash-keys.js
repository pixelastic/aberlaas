import { preferLodashMethod } from './helpers/prefer-lodash-method.js';

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Prefer `_.keys()` over `Object.keys()`',
    },
    fixable: 'code',
    schema: [],
    messages: {
      preferLodash: 'Use `_.keys()` instead of `Object.keys()`',
    },
  },
  /**
   * @param {import('eslint').Rule.RuleContext} context - ESLint rule context
   * @returns {import('eslint').Rule.RuleListener} Rule visitor object
   */
  create(context) {
    return preferLodashMethod('keys', context);
  },
};
