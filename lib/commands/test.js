/* eslint-disable jest/no-jest-import */
const helper = require('../helper');
const _ = require('golgoth/lib/lodash');

module.exports = {
  /**
   * Transform all aberlaas test cli options into suitable jest-cli options
   * @param {object} cliArgs CLI Argument object, as created by minimist
   * @returns {Array} Array of cli arguments and values
   **/
  async jestCliArguments(cliArgs = {}) {
    const args = {
      ...cliArgs,
      cache: false,
      passWithNoTests: true,
    };
    // Default list of files
    if (_.isEmpty(args._)) {
      args._ = [helper.hostPath()];
    }
    // Config file
    args.config = await helper.configFile(
      cliArgs.config,
      'jest.config.js',
      'lib/configs/jest.js'
    );
    // Set no-watchman when watching
    if (args.watch) {
      args.watchman = false;
    }

    // Handle additional --failFast switch to stop after one test fails
    if (args.failFast) {
      delete args.failFast;
      this.setEnv('ABERLAAS_TEST_FAIL_FAST', true);
    }

    // Convert to array of cli arguments
    return _.transform(
      args,
      (result, value, key) => {
        if (key === '_') {
          return;
        }
        if (value === true) {
          result.push(`--${key}`);
          return;
        }
        if (value === false) {
          result.push(`--no-${key}`);
          return;
        }
        result.push(`--${key}`);
        result.push(value);
      },
      [...args._]
    );
  },
  /**
   * Test all files using Jest
   * @param {object} cliArgs CLI Argument object, as created by minimist
   **/
  async run(cliArgs) {
    const options = await this.jestCliArguments(cliArgs);
    await this.__jestRun(options);
  },
  /**
   * Wrapper method around jest.run. Using a wrapper here makes it easier to
   * mock the call in our tests. Because we are using jest itself to test this
   * file, mocking jest from inside of it is not practical, so we need to wrap
   * it.
   * @param {object} options CLI Options to pass to jest.run
   **/
  async __jestRun(options) {
    // We lazy-load jest here because importing it at the top kinda confuses
    // Jest when we're running tests and complaining about cyclical
    // dependencies. So we're loading it only when needed.
    if (!this.__jest) {
      this.__jest = require('jest');
    }

    await this.__jest.run(options);
  },
  /**
   * Set an environment variable to a specific value
   * @param {string} key Key entry
   * @param {string} value Value to set
   **/
  setEnv(key, value) {
    process.env[key] = value;
  },
};
