/* global beforeEach, expect */
/**
 * Make the following variables available in each test:
 * - testName: contains the name of the current test
 * - describeName: contains the name of the parent describe block
 */
beforeEach(() => {
  const fullName = expect.getState().currentTestName;
  const parts = fullName.split(' > ');

  // testName is the last part (the actual test name)
  globalThis.testName = parts.at(-1);

  // describeName is the penultimate
  globalThis.describeName = parts.at(-2);
});
