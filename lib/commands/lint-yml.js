import helper from '../helper';
import { _, pMap } from 'golgoth';
import yamlLint from 'yaml-lint';
import firost from 'firost';
import path from 'path';
export default {
  /**
   * Returns the list of all YAML input files
   * @param {object} cliArgs CLI Argument object, as created by minimist
   * @returns {Array} Array of YAML files
   **/
  async getInputFiles(cliArgs = {}) {
    const inputPatterns = helper.inputFromCli(cliArgs, '.');
    return await helper.findHostFiles(inputPatterns, ['.yml', '.yaml']);
  },
  /**
   * Lint a YAML content
   * @param {string} input YAML content
   * Note: Throws an error on failure
   * @returns {boolean} True on success
   **/
  async lint(input) {
    try {
      await yamlLint.lint(input);
    } catch (error) {
      throw helper.error(error.name, error.message);
    }
    return true;
  },
  /**
   * Lint all YAML files and display results.
   * @param {object} cliArgs CLI Argument object, as created by minimist
   * @returns {boolean} True on success
   **/
  async run(cliArgs) {
    // If --fix is passed, we defer to prettier
    if (_.get(cliArgs, 'fix')) {
      await this.fix(cliArgs);
      return;
    }

    const files = await this.getInputFiles(cliArgs);

    let hasErrors = false;
    await pMap(files, async filepath => {
      const input = await firost.read(filepath);
      try {
        await this.lint(input);
      } catch (error) {
        hasErrors = true;
        const relativePath = path.relative(helper.hostRoot(), filepath);
        helper.consoleError(`Invalid YAML: ${relativePath}`);
        helper.consoleError(error.message);
      }
    });

    if (hasErrors) {
      process.exit(1);
      return false;
    }
    return true;

    // // If --fix is passed, we defer to prettier
    // if (_.get(cliArgs, 'fix')) {
    //   await this.fix(cliArgs);
    //   return;
    // }
  },
  async fix(cliArgs) {
    const files = await this.getInputFiles(cliArgs);
    const binary = await helper.which('prettier');
    const options = [...files, '--write'];
    await helper.spawn(binary, options);
  },
};
