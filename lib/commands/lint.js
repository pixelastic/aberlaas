import helper from '../helper';
import path from 'path';
import { _ } from 'golgoth';
export default {
  /**
   * Get list of files to lint
   * Default is to read from ./lib, but if files are passed as CLI arguments,
   * then will take precedence
   * @param {Object} cliArgs CLI Argument object, as created by minimist
   * @returns {Array} List of files to lint
   **/
  inputFiles(cliArgs = {}) {
    let inputFiles = _.get(cliArgs, '_', []);
    if (_.isEmpty(inputFiles)) {
      inputFiles = ['./lib', './*.js', './.*.js'];
    }

    const hostRoot = helper.hostRoot();
    return _.map(inputFiles, inputFile => path.join(hostRoot, inputFile));
  },
  /**
   * Transform all aberlaas lint cli options into suitable eslint-cli options
   * @param {Object} cliArgs CLI Argument object, as created by minimist
   * @returns {Array} Array of cli arguments and values
   **/
  eslintCliArguments(cliArgs = {}) {
    // Input files
    const inputFiles = this.inputFiles(cliArgs);
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
   * Lint all files and display results
   * @param {Object} cliArgs CLI Argument object, as created by minimist
   * @returns {Void}
   **/
  async run(cliArgs) {
    const binary = await helper.which('eslint');
    const options = this.eslintCliArguments(cliArgs);
    await helper.spawn(binary, options);
  },
};
