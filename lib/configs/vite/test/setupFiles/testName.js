/* global beforeEach, expect */
/**
 * Make the variable `testName` contain the name of the current test in each
 * test
 */
beforeEach(() => {
  const fullName = expect.getState().currentTestName;
  globalThis.testName = fullName.split(' > ').pop();
});
