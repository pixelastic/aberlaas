/* eslint-disable jest/no-jasmine-globals */
import * as failFast from 'jasmine-fail-fast';
import captureOutput from './captureOutput.js';

/**
 * This is a hack to allow Jest to stop all testing as soon as one test fails.
 * The default --bail option of Jest only stop testing if a whole test suite
 * (ie. a file) fails
 * This hack works by tapping directly into the underlying Jasmine instance used
 * by Jest
 *
 * This file is loaded through the setupFilesAfterEnv value in Jest config and
 * enables the hack only if a specific environment variable is set.
 * Pass --failFast to "aberlaas test" does set this ENV variable for you
 *
 * See https://github.com/facebook/jest/issues/2867#issuecomment-370624846 for
 * the source of the hack
 **/
if (process.env.ABERLAAS_TEST_FAIL_FAST) {
  const jasmineEnv = jasmine.getEnv();
  jasmineEnv.addReporter(failFast.init());
}

/**
 * Expose global variables to all Jest tests
 **/
jasmine.getEnv().addReporter({
  specStarted(result) {
    // This exposes a global `testName` variable in all tests, so we can refer
    // to the test name directly
    global.testName = result.description;

    // Add method to capture stdout/stderr output
    global.captureOutput = captureOutput.run.bind(captureOutput);
  },
});