import helper from '../../helper.js';
import _ from 'golgoth/lodash.js';
import firostError from 'firost/error.js';
import { ESLint } from 'eslint';

export default {
  /**
   * Find all relevant files
   * @param {Array} userPatterns Patterns to narrow the search down
   * @returns {Array} Array of files
   **/
  async getInputFiles(userPatterns) {
    const filePatterns = _.isEmpty(userPatterns) ? ['./**/*.js'] : userPatterns;
    return await helper.findHostFiles(filePatterns, ['.js']);
  },
  /**
   * Lint all files and display results.
   * @param {Array} userPatterns Patterns to narrow the search down
   * @param {string} userConfigFile Custom config file to use
   * @param {object} userOptions Options to pass to ESLint, including fix
   * @returns {boolean} True on success
   **/
  async run(userPatterns, userConfigFile, userOptions = {}) {
    // Options
    const options = { fix: false, ...userOptions };

    // Files to lint
    const files = await this.getInputFiles(userPatterns);
    if (_.isEmpty(files)) {
      return true;
    }

    // Config file
    const configFile = await helper.configFile(
      userConfigFile,
      '.eslintrc.cjs',
      'configs/eslint.cjs',
    );

    // Run the actual lint
    const eslint = new ESLint({
      overrideConfigFile: configFile,
      resolvePluginsRelativeTo: helper.aberlaasRoot(),
      ...options,
    });
    const results = await eslint.lintFiles(files);

    // Fix
    if (options.fix) {
      await ESLint.outputFixes(results);
    }

    // All good, we can stop
    const errorCount = _.chain(results).map('errorCount').sum().value();
    if (errorCount == 0) {
      return true;
    }

    // Format errors
    const formatter = await eslint.loadFormatter('stylish');
    const errorText = formatter.format(results);
    throw firostError('JavaScriptLintError', errorText);
  },
  /**
   * Autofix files in place
   * @param {Array} userPatterns Patterns to narrow the search down
   * @param {string} userConfigFile Custom config file to use
   * @returns {boolean} True on success
   **/
  async fix(userPatterns, userConfigFile) {
    return await this.run(userPatterns, userConfigFile, { fix: true });
  },
};
