import helper from '../helper';
import { _ } from 'golgoth';
export default {
  async getCssFiles(cliArgs = {}) {
    const inputPatterns = helper.inputFromCli(cliArgs, '.');
    return await helper.findHostFiles(inputPatterns, ['.css']);
  },
  /**
   * Transform incoming CLI arguments into arguments for stylelint
   * @param {object} cliArgs CLI Argument object, as created by minimist
   * @returns {Array} Array of cli arguments and values
   **/
  async getStylelintArguments(cliArgs = {}) {
    const options = [];

    // Config
    const configFile = await helper.configFile(
      cliArgs,
      '.stylelintrc.js',
      'configs/stylelint.js'
    );
    options.push('--config');
    options.push(configFile);

    // Misc
    options.push('--color');

    return options;
  },
  // /**
  //  * Transform incoming CLI arguments into arguments for prettier
  //  * @param {object} cliArgs CLI Argument object, as created by minimist
  //  * @returns {Array} Array of cli arguments and values
  //  **/
  // async getPrettierArguments(cliArgs = {}) {
  //   // Input files
  //   const inputPatterns = helper.inputFromCli(cliArgs, '.');
  //   const inputFiles = await helper.findHostFiles(inputPatterns, ['.json']);
  //   const options = [...inputFiles];

  //   options.push('--write');

  //   return options;
  // },
  /**
   * Lint all JSON files and display results.
   * @param {object} cliArgs CLI Argument object, as created by minimist
   * @returns {boolean} True on success, false otherwise
   **/
  async run(cliArgs) {
    // Stop early if no file to lint
    const inputFiles = await this.getCssFiles(cliArgs);
    if (_.isEmpty(inputFiles)) {
      return false;
    }

    const stylelintOptions = await this.getStylelintArguments(cliArgs);
    const options = _.concat([], inputFiles, stylelintOptions);
    const binary = await helper.which('stylelint');

    // // If --fix is passed, we defer to prettier
    // if (_.get(cliArgs, 'fix')) {
    //   await this.fix(cliArgs);
    //   return;
    // }

    await helper.spawn(binary, options);
    return true;
  },
  // /**
  //  * Fix all JSON files using prettier
  //  * @param {object} cliArgs CLI Argument object, as created by minimist
  //  **/
  // async fix(cliArgs) {
  //   const binary = await helper.which('prettier');
  //   const options = await this.getPrettierArguments(cliArgs);
  //   await helper.spawn(binary, options);
  // },
};
