// Helpful matchers not included in Vitest
import { _ } from 'golgoth';
import { expect } from 'vitest';

expect.extend({
  toInclude(received, expected) {
    return {
      pass: _.includes(received, expected),
      message: () =>
        this.isNot
          ? `expected not to include ${expected}`
          : `expected to include ${expected}`,
    };
  },

  toBeString(received) {
    return {
      pass: _.isString(received),
      message: () =>
        this.isNot ? 'expected not to be a string' : 'expected to be a string',
    };
  },

  toStartWith(received, expected) {
    return {
      pass: _.startsWith(received, expected),
      message: () =>
        this.isNot
          ? `expected not to start with ${expected}`
          : `expected to start with ${expected}`,
    };
  },

  toEndWith(received, expected) {
    return {
      pass: _.endsWith(received, expected),
      message: () =>
        this.isNot
          ? `expected not to end with ${expected}`
          : `expected to end with ${expected}`,
    };
  },
});
