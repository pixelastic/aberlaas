import helper from '../helper';
import { _ } from 'golgoth';
export default {
  /**
   * Transform incoming CLI arguments into arguments for jsonlint
   * @param {object} cliArgs CLI Argument object, as created by minimist
   * @returns {Array} Array of cli arguments and values
   **/
  async getJsonlintArguments(cliArgs = {}) {
    // Input files
    const inputPatterns = helper.inputFromCli(cliArgs, '.');
    const inputFiles = await helper.findHostFiles(inputPatterns, ['.json']);
    const options = [...inputFiles];

    options.push('--quiet');
    options.push('--compact');

    return options;
  },
  /**
   * Transform incoming CLI arguments into arguments for prettier
   * @param {object} cliArgs CLI Argument object, as created by minimist
   * @returns {Array} Array of cli arguments and values
   **/
  async getPrettierArguments(cliArgs = {}) {
    // Input files
    const inputPatterns = helper.inputFromCli(cliArgs, '.');
    const inputFiles = await helper.findHostFiles(inputPatterns, ['.json']);
    const options = [...inputFiles];

    options.push('--write');

    return options;
  },
  /**
   * Lint all JSON files and display results.
   * @param {object} cliArgs CLI Argument object, as created by minimist
   **/
  async run(cliArgs) {
    // If --fix is passed, we defer to prettier
    if (_.get(cliArgs, 'fix')) {
      await this.fix(cliArgs);
      return;
    }

    const binary = await helper.which('jsonlint');
    const options = await this.getJsonlintArguments(cliArgs);
    await helper.spawn(binary, options);
  },
  /**
   * Fix all JSON files using prettier
   * @param {object} cliArgs CLI Argument object, as created by minimist
   **/
  async fix(cliArgs) {
    const binary = await helper.which('prettier');
    const options = await this.getPrettierArguments(cliArgs);
    await helper.spawn(binary, options);
  },
};
