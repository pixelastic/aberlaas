import { preferLodashMethod } from './helpers/prefer-lodash-method.js';

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Prefer `_.values()` over `Object.values()`',
    },
    fixable: 'code',
    schema: [],
    messages: {
      preferLodash: 'Use `_.values()` instead of `Object.values()`',
    },
  },
  /**
   * @param {import('eslint').Rule.RuleContext} context - ESLint rule context
   * @returns {import('eslint').Rule.RuleListener} Rule visitor object
   */
  create(context) {
    return preferLodashMethod('values', context);
  },
};
