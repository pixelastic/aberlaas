import helper from '../helper';
export default {
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

    // Config
    const configFile = await helper.configFile(
      cliArgs,
      '.eslintrc.js',
      'configs/eslint.js'
    );
    options.push('--config');
    options.push(configFile);

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
