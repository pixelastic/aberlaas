import { _ } from 'golgoth';
import { firostError } from 'firost';
import { findHostPackageFiles, getConfig } from 'aberlaas-helper';
import stylelint from 'stylelint';
import stylelintConfig from '../configs/stylelint.js';
import { prettierFix } from './helpers/prettierFix.js';

export let __;

/**
 * Lint all files and display results.
 * @param {Array} userPatterns Patterns to narrow the search down
 * @param {string} userConfigFile Custom config file to use
 * @param {object} userOptions Options to pass to ESLint, including fix
 * @returns {boolean} True on success
 */
export async function run(userPatterns, userConfigFile, userOptions = {}) {
  // Options
  const options = { fix: false, ...userOptions };

  // Files
  const files = await __.getInputFiles(userPatterns);
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
}

/**
 * Autofix files in place
 * @param {Array} userPatterns Patterns to narrow the search down
 * @param {string} userConfigFile Custom config file to use
 * @returns {boolean} True on success
 */
export async function fix(userPatterns, userConfigFile) {
  const files = await __.getInputFiles(userPatterns);
  if (_.isEmpty(files)) {
    return true;
  }
  // Try to pretiffy as much as we can
  await __.prettierFix(files);
  // Still run a lint on it so it can fail if not everything is fixed
  await run(userPatterns, userConfigFile, { fix: true });
  return true;
}

__ = {
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

  prettierFix,
};

export default {
  run,
  fix,
};
