import { _ } from 'golgoth';
import { firostError } from 'firost';
import { findHostPackageFiles } from 'aberlaas-helper';
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
    throw firostError('ABERLAAS_LINT_JSON', err.message);
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

  // Note: The @eslint/json plugin doesn't seem to support fixing the JSON and
  // chokes on malformed JSON (like trailing commas).
  // Prettier, on the other hand, can fix trailing commas.
  // So we run both.
  try {
    // To fix most issues ESLint can't fix
    await __.prettierFix(files);
    // To warn about leftover issues
    return await run(userPatterns, userConfigFile, { fix: true });
  } catch (err) {
    throw firostError('ABERLAAS_LINT_JSON_FIX', err.message);
  }
}

__ = {
  /**
   * Find all relevant files
   * @param {Array} userPatterns Patterns to narrow the search down
   * @returns {Array} Array of files
   */
  async getInputFiles(userPatterns) {
    const filePatterns = _.isEmpty(userPatterns)
      ? ['./**/*.json']
      : userPatterns;
    return await findHostPackageFiles(filePatterns, ['.json']);
  },

  prettierFix,
};

export default {
  run,
  fix,
};
