import helper from '../../helper.js';
import { fix as prettierFix } from './helpers/prettier.js';
import _ from 'golgoth/lodash.js';
import firostError from 'firost/error.js';
import run from 'firost/run.js';

export default {
  /**
   * Find all relevant files
   * @param {Array} userPatterns Patterns to narrow the search down
   * @returns {Array} Array of files
   **/
  async getInputFiles(userPatterns) {
    return await helper.findHostFiles(userPatterns, ['.css']);
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
      '.stylelintrc.cjs',
      'configs/stylelint.cjs',
    );
    const binary = await helper.which('stylelint');
    const options = [...files, '--color', '--config', configFile];
    try {
      await run(`${binary} ${options.join(' ')}`, { stdout: false });
    } catch (error) {
      // If it fails because no files passed actually exists, it's not really
      // a failure
      const errorMessage = error.stdout;
      if (_.startsWith(errorMessage, 'Error: No files matching the pattern')) {
        return true;
      }
      throw firostError('ERROR_CSS_LINT', error.stdout);
    }
    return true;
  },
  /**
   * Autofix files in place
   * @param {Array} userPatterns Patterns to narrow the search down
   * @param {string} userConfigFile Custom config file to use
   * @returns {boolean} True on success
   **/
  async fix(userPatterns, userConfigFile) {
    const files = await this.getInputFiles(userPatterns);
    if (_.isEmpty(files)) {
      return true;
    }
    // Try to pretiffy as much as we can
    await this.__prettierFix(files);
    // Still run a lint on it so it can fail if not everything is fixed
    await this.run(userPatterns, userConfigFile);
    return true;
  },
  __prettierFix: prettierFix,
  __run: run,
};
