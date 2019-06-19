/* eslint-disable jest/no-jest-import */
import jest from 'jest';
import path from 'path';
import helper from '../helper';
import { _ } from 'golgoth';
import firost from 'firost';
export default {
  /**
   * Get list of files to test
   * Default is to test all files in ./lib (according to the config in
   * jest.config.js), but specific directory/files can be overwritten from the
   * command line level
   * @param {object} cliArgs CLI Argument object, as created by minimist
   * @returns {Array} List of files to test
   **/
  inputFiles(cliArgs = {}) {
    const defaultFiles = ['./lib'];
    const inputFromCli = _.get(cliArgs, '_', defaultFiles);
    // Input can still be empty when _ is passed as []
    if (_.isEmpty(inputFromCli)) {
      return defaultFiles;
    }
    return inputFromCli;
  },
  /**
   * Get the path to the jest config file
   * Will look for a jest.config.js in the host root by default, or anything
   * passed on the --config flag. Will fallback on the default aberlaas config
   * if nothing is found
   * @param {object} cliArgs CLI Argument object, as created by minimist
   * @returns {string} Path to the jest config file
   **/
  async configFile(cliArgs = {}) {
    // Taking value from --config in CLI in priority
    const configFromCli = cliArgs.config;
    if (configFromCli) {
      return path.resolve(helper.hostRoot(), configFromCli);
    }

    // Checking for jest.config.js in the host
    const configFromHost = helper.hostPath('jest.config.js');
    if (await firost.exists(configFromHost)) {
      return configFromHost;
    }

    // Fallback on default config in aberlaas
    return path.join(helper.aberlaasPath('configs/jest.js'));
  },
  /**
   * Transform all aberlaas build cli options into suitable jest-cli options
   * @param {object} cliArgs CLI Argument object, as created by minimist
   * @returns {Array} Array of cli arguments and values
   **/
  async jestCliArguments(cliArgs = {}) {
    // Input files
    const inputFiles = helper.inputFromCli(cliArgs, ['./lib']);
    const options = [...inputFiles];

    // Config
    const configFile = await this.configFile(cliArgs);
    options.push('--config');
    options.push(configFile);

    // Misc
    options.push('--no-cache');
    options.push('--passWithNoTests');

    // Watch
    if (cliArgs.watch) {
      options.push('--watch');
      options.push('--no-watchman');
    }

    return options;
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
    await jest.run(options);
  },
};
