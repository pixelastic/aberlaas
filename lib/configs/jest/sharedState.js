/**
 * Jest environments are sandboxed by test suite. To be able to fail fast and
 * stop all tests as soon as one of them failed, we are using this file as an
 * external singleton.
 **/
module.exports = {
  __skipAllTests: false,
  skipAllTests() {
    this.__skipAllTests = true;
  },
  shouldSkipAllTests() {
    return this.__skipAllTests;
  },
};
