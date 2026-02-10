/* global beforeEach, expect */

// Make testName available in all it() callbacks
beforeEach(() => {
  globalThis.testName = expect.getState().currentTestName.split(' > ').at(-1);
});
