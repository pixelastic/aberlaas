import helper from '../helper';
import firost from 'firost';
import path from 'path';
import { _, pMap, chalk } from 'golgoth';
export default {
  /**
   * Returns the list of all JSON input files
   * @param {object} cliArgs CLI Argument object, as created by minimist
   * @returns {Array} Array of JSON files
   **/
  async getInputFiles(cliArgs) {
    const inputPatterns = helper.inputFromCli(cliArgs, '.');
    return await helper.findHostFiles(inputPatterns, ['.json']);
  },
  /**
   * Transform incoming CLI arguments into arguments for prettier
   * @param {object} cliArgs CLI Argument object, as created by minimist
   * @returns {Array} Array of cli arguments and values
   **/
  async getPrettierArguments(cliArgs = {}) {
    const inputFiles = await this.getInputFiles(cliArgs);
    if (_.isEmpty(inputFiles)) {
      return false;
    }

    const options = [...inputFiles];

    options.push('--write');

    return options;
  },
  /**
   * Lint all JSON files and display results.
   * @param {object} cliArgs CLI Argument object, as created by minimist
   * @returns {boolean} True on success
   **/
  async run(cliArgs) {
    // If --fix is passed, we defer to prettier
    if (_.get(cliArgs, 'fix')) {
      await this.fix(cliArgs);
      return;
    }

    const inputFiles = await this.getInputFiles(cliArgs);
    let hasErrors = false;
    await pMap(inputFiles, async filepath => {
      try {
        JSON.parse(await firost.read(filepath));
      } catch (err) {
        hasErrors = true;
        const relativePath = path.relative(helper.hostRoot(), filepath);
        this.output(`Invalid JSON: ${chalk.red(relativePath)}`);
        this.output(err.message);
      }
    });
    if (hasErrors) {
      process.exit(1);
      return false;
    }
    return true;
  },
  /**
   * Fix all JSON files using prettier
   * @param {object} cliArgs CLI Argument object, as created by minimist
   **/
  async fix(cliArgs) {
    const binary = await helper.which('prettier');
    const options = await this.getPrettierArguments(cliArgs);
    if (!options) {
      return;
    }
    await helper.spawn(binary, options);
  },
  /**
   * Wrapper around console.info. Wrapping it makes it easier to mock in tests
   * and not pollute the display
   * @param {string} text Text to display
   **/
  output(text) {
    console.info(text);
  },
};
