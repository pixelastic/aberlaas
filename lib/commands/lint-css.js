import helper from '../helper';
import execa from 'execa';
import lint from './lint';
import { _ } from 'golgoth';
export default {
  /**
   * Find all relevant files
   * @param {Array} userPatterns Patterns to narrow the search down
   * @returns {Array} Array of files
   **/
  async getInputFiles(userPatterns) {
    return await lint.getInputFiles(['.css'], userPatterns);
  },
  /**
   * Lint all files and display results.
   * @param {Array} userPatterns Patterns to narrow the search down
   * @param {string} userConfigFile Custom config file to use
   * @returns {boolean} True on success
   **/
  async run(userPatterns, userConfigFile) {
    const files = await this.getInputFiles(userPatterns);
    if (_.isEmpty(files)) {
      return true;
    }

    const configFile = await helper.configFile(
      userConfigFile,
      '.stylelintrc.js',
      'build/configs/stylelint.js'
    );
    const options = [...files, '--color', '--config', configFile];
    const binary = await helper.which('stylelint');
    try {
      await this.__execa(binary, options);
    } catch (error) {
      throw helper.error('CssLintError', error.stdout);
    }
    return true;
  },
  /**
   * Autofix files in place
   * @param {Array} userPatterns Patterns to narrow the search down
   * @returns {boolean} True on success
   **/
  async fix(userPatterns) {
    const files = await this.getInputFiles(userPatterns);
    if (_.isEmpty(files)) {
      return true;
    }
    await lint.fixWithPrettier(files);
    return true;
  },
  __execa: execa,
};
