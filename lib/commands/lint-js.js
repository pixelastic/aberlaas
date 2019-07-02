import helper from '../helper';
import path from 'path';
import firost from 'firost';
export default {
  /**
   * Get the path to the ESLint config file.
   * Will look for a .eslintrc.js in the host root by default, or anything
   * passed on the --config flag. Will fallback on the default aberlaas config
   * if nothing is found.
   * @param {object} cliArgs CLI Argument object, as created by minimist
   * @returns {string} Path to the ESLint config file
   **/
  async configFile(cliArgs = {}) {
    // Taking value from --config in CLI in priority
    const configFromCli = cliArgs.config;
    if (configFromCli) {
      return configFromCli;
    }

    // Checking for .eslintrc.js in the host
    const configFromHost = helper.hostPath('.eslintrc.js');
    if (await firost.exists(configFromHost)) {
      return configFromHost;
    }

    // Fallback on default config in aberlaas
    return path.join(helper.aberlaasPath('configs/eslint.js'));
  },
  /**
   * Transform all aberlaas lint cli options into suitable eslint-cli options.
   * @param {object} cliArgs CLI Argument object, as created by minimist
   * @returns {Array} Array of cli arguments and values
   **/
  async eslintCliArguments(cliArgs = {}) {
    // Input files
    const inputPatterns = helper.inputFromCli(cliArgs, '.');
    const inputFiles = await helper.findHostFiles(inputPatterns, ['.js']);
    const options = [...inputFiles];

    // Misc
    options.push('--color');

    // Fix
    if (cliArgs.fix) {
      options.push('--fix');
    }

    return options;
  },
  /**
   * Lint all files JavaScript and display results.
   * @param {object} cliArgs CLI Argument object, as created by minimist
   **/
  async run(cliArgs) {
    const binary = await helper.which('eslint');
    const options = await this.eslintCliArguments(cliArgs);
    await helper.spawn(binary, options);
  },
};
