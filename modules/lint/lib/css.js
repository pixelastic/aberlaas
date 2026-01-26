import stylelint from 'stylelint';
import { _ } from 'golgoth';
import { firostError } from 'firost';
import { findHostPackageFiles, getConfig } from 'aberlaas-helper';
import stylelintConfig from '../configs/stylelint.js';
import { fix as prettierFix } from './helpers/prettier.js';

export default {
  /**
   * Find all relevant files
   * @param {Array} userPatterns Patterns to narrow the search down
   * @returns {Array} Array of files
   */
  async getInputFiles(userPatterns) {
    const filePatterns = _.isEmpty(userPatterns)
      ? ['./**/*.css']
      : userPatterns;
    return await findHostPackageFiles(filePatterns, ['.css']);
  },
  /**
   * Lint all files and display results.
   * @param {Array} userPatterns Patterns to narrow the search down
   * @param {string} userConfigFile Custom config file to use
   * @param {object} userOptions Options to pass to ESLint, including fix
   * @returns {boolean} True on success
   */
  async run(userPatterns, userConfigFile, userOptions = {}) {
    // Options
    const options = { fix: false, ...userOptions };

    // Files
    const files = await this.getInputFiles(userPatterns);
    if (_.isEmpty(files)) {
      return true;
    }

    // Config
    const config = await getConfig(
      userConfigFile,
      'stylelint.config.js',
      stylelintConfig,
    );

    const result = await stylelint.lint({
      config,
      files,
      formatter: 'string',
      ...options,
    });

    if (result.errored) {
      throw firostError('ABERLAAS_LINT_CSS', result.report);
    }
    return true;
  },
  /**
   * Autofix files in place
   * @param {Array} userPatterns Patterns to narrow the search down
   * @param {string} userConfigFile Custom config file to use
   * @returns {boolean} True on success
   */
  async fix(userPatterns, userConfigFile) {
    const files = await this.getInputFiles(userPatterns);
    if (_.isEmpty(files)) {
      return true;
    }
    // Try to pretiffy as much as we can
    await prettierFix(files);
    // Still run a lint on it so it can fail if not everything is fixed
    await this.run(userPatterns, userConfigFile, { fix: true });
    return true;
  },
};
