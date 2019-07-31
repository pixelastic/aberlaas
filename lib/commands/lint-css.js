import helper from '../helper';
import { _ } from 'golgoth';
export default {
  /**
   * Returns the list of all CSS files in the project
   * @param {object} cliArgs CLI Argument object, as created by minimist
   * @returns {Array} List of CSS files
   **/
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
      'build/configs/stylelint.js'
    );
    options.push('--config');
    options.push(configFile);

    // Misc
    options.push('--color');

    return options;
  },
  /**
   * Returns the arguments to pass to prettier for fixing the files
   * @returns {Array} Array of cli arguments and values
   **/
  async getPrettierArguments() {
    return ['--write'];
  },
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

    // If --fix is passed, we defer to prettier
    if (_.get(cliArgs, 'fix')) {
      await this.fix(inputFiles);
      return;
    }

    const stylelintOptions = await this.getStylelintArguments(cliArgs);
    const options = _.concat([], inputFiles, stylelintOptions);
    const binary = await helper.which('stylelint');

    await helper.spawn(binary, options);
    return true;
  },
  /**
   * Fix all CSS files using prettier
   * @param {Array} inputFiles List of files to fix
   **/
  async fix(inputFiles) {
    const binary = await helper.which('prettier');
    const prettierArgs = await this.getPrettierArguments();
    const options = _.concat([], inputFiles, prettierArgs);
    await helper.spawn(binary, options);
  },
};
