/**
 * Make describeName available as a variable in the describe() body.
 *
 * Note: We need to replace the initial describe with a wrapped version that
 * sets describeName when the callback is being executed. We need to be careful
 * to correctly keep all the inner methods as well (like .only, .concurrent,
 * etc).
 **/
/* global beforeEach, expect */

// Keep reference to original method
const originalDescribe = globalThis.describe;

// New wrapping method, that sets describeName when the callback is executed
const wrappedDescribe = function (name, callback) {
  originalDescribe(name, () => {
    globalThis.describeName = name;
    callback();
  });
};

// Re-assign the method, but keep internal methods
globalThis.describe = Object.defineProperties(
  wrappedDescribe,
  Object.getOwnPropertyDescriptors(originalDescribe),
);

// Make describeName available in all it() callbacks
beforeEach(() => {
  globalThis.describeName = expect
    .getState()
    .currentTestName.split(' > ')
    .at(-2);
});
