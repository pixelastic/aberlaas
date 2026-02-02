import { _ } from 'golgoth';
import { firostError } from 'firost';
import { findHostPackageFiles } from 'aberlaas-helper';
import { eslintRun } from './helpers/eslintRun.js';

export let __;

/**
 * Lint all files and display results.
 * @param {Array} userPatterns Patterns to narrow the search down
 * @param {string} userConfigFile Custom config file to use
 * @param {object} userOptions Options to pass to ESLint, including fix
 * @returns {boolean} True on success
 */
export async function run(userPatterns, userConfigFile, userOptions = {}) {
  const files = await __.getInputFiles(userPatterns);

  try {
    await eslintRun(files, userConfigFile, userOptions);
    return true;
  } catch (err) {
    throw firostError('ABERLAAS_LINT_JS', err.message);
  }
}

/**
 * Autofix files in place
 * @param {Array} userPatterns Patterns to narrow the search down
 * @param {string} userConfigFile Custom config file to use
 * @returns {boolean} True on success
 */
export async function fix(userPatterns, userConfigFile) {
  return await run(userPatterns, userConfigFile, { fix: true });
}

__ = {
  /**
   * Find all relevant files
   * @param {Array} userPatterns Patterns to narrow the search down
   * @returns {Array} Array of files
   */
  async getInputFiles(userPatterns) {
    const filePatterns = _.isEmpty(userPatterns) ? ['./**/*.js'] : userPatterns;
    const allowedExtensions = ['.js', '.jsx', '.ts', '.tsx'];

    return await findHostPackageFiles(filePatterns, allowedExtensions);
  },
};

export default {
  run,
  fix,
};
