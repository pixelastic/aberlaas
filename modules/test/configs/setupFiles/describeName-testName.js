/* global beforeEach, expect */

// We make describeName available in the describe() body
const originalDescribe = globalThis.describe;
globalThis.describe = function (name, callback, options) {
  originalDescribe(
    name,
    () => {
      globalThis.describeName = name;
      callback();
    },
    options,
  );
};

// We also make testName and describeName available in the it() body
beforeEach(() => {
  const fullName = expect.getState().currentTestName;
  const parts = fullName.split(' > ');

  globalThis.testName = parts.at(-1);
  globalThis.describeName = parts.at(-2);
});
