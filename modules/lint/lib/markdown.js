import { _ } from 'golgoth';
import { firostError } from 'firost';
import { findHostFiles } from 'aberlaas-helper';
import { eslintRun } from './helpers/eslintRun.js';
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
  const files = await __.getInputFiles(userPatterns);

  try {
    await eslintRun(files, userConfigFile, userOptions);
    return true;
  } catch (err) {
    throw firostError('ABERLAAS_LINT_MARKDOWN', err.message);
  }
}

/**
 * Autofix files in place
 * @param {Array} userPatterns Patterns to narrow the search down
 * @param {string} userConfigFile Custom config file to use
 * @returns {boolean} True on success
 */
export async function fix(userPatterns, userConfigFile) {
  const files = await __.getInputFiles(userPatterns);

  // Prettier fixes none of the autofixable ESLint rules, and ESLint fixes can
  // leave the file badly formatted. So we run Prettier, then ESLint, then
  // Prettier again.
  try {
    await prettierFix(files);
    await eslintRun(files, userConfigFile, { fix: true });
    await prettierFix(files);
    return true;
  } catch (error) {
    throw firostError('ABERLAAS_LINT_MARKDOWN_FIX', error.message);
  }
}

__ = {
  /**
   * Find all relevant files
   * @param {Array} userPatterns Patterns to narrow the search down
   * @returns {Array} Array of files
   */
  async getInputFiles(userPatterns) {
    const filePatterns = _.isEmpty(userPatterns) ? ['./**/*.md'] : userPatterns;
    return await findHostFiles(filePatterns, ['.md']);
  },
};

export default {
  run,
  fix,
};
