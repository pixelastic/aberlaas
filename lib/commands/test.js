/* eslint-disable jest/no-jest-import */
import jest from 'jest';
import helper from '../helper';
export default {
  /**
   * Transform all aberlaas build cli options into suitable jest-cli options
   * @param {object} cliArgs CLI Argument object, as created by minimist
   * @returns {Array} Array of cli arguments and values
   **/
  async jestCliArguments(cliArgs = {}) {
    // Input files
    const inputPatterns = helper.inputFromCli(cliArgs, '.');
    const inputFiles = await helper.findHostFiles(inputPatterns, ['.js']);
    const options = [...inputFiles];

    // Config
    const configFile = await helper.configFile(
      cliArgs,
      'jest.config.js',
      'configs/jest.js'
    );
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
