const NodeEnvironment = require('jest-environment-node');
const shouldFailFast = process.env.ABERLAAS_TEST_FAIL_FAST;
const sharedState = require('./sharedState.js');

class AberlaasEnvironment extends NodeEnvironment {
  async handleTestEvent(event, _state) {
    this.failFast(event);
    this.setTestName(event);
  }
  /**
   * If one test fails, we skip all other tests
   * @param {object} event As fired by handleTestEvent
   */
  failFast(event) {
    // Do nothing if --failFast is not passed
    if (!shouldFailFast) {
      return;
    }

    // Whenever a test is failing, we update the shared state to skip all other
    // tests
    const eventName = event.name;
    const isTestFailing = eventName == 'test_fn_failure';
    const isTestStarting = eventName === 'test_start';

    if (isTestFailing) {
      sharedState.skipAllTests();
    }
    if (isTestStarting && sharedState.shouldSkipAllTests()) {
      event.test.mode = 'skip';
    }
  }
  /**
   * When a test starts, we set the global variable testName to the name of the
   * test
   * @param {object} event As fired by handleTestEvent
   **/
  setTestName(event) {
    const eventName = event.name;
    if (eventName === 'test_start') {
      this.global.testName = event.test.name;
    }
  }
}

module.exports = AberlaasEnvironment;
