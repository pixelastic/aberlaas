import { _ } from 'golgoth';
import { findHostFiles } from 'aberlaas-helper';
import { prettierFix } from './helpers/prettierFix.js';

export let __;

/**
 * Lint HTML files
 * @returns {boolean} True on success
 */
export async function run() {
  // We do not currently have an HTML Linter, only a Formatter
  return true;
}

/**
 * Autofix HTML files in place
 * @param {Array} userPatterns Patterns to narrow the search down
 * @returns {boolean} True on success
 */
export async function fix(userPatterns) {
  const files = await __.getInputFiles(userPatterns);
  if (_.isEmpty(files)) {
    return true;
  }
  await __.prettierFix(files);
}

__ = {
  /**
   * Find all relevant HTML files
   * @param {Array} userPatterns Patterns to narrow the search down
   * @returns {Array} Array of files
   */
  async getInputFiles(userPatterns) {
    const filePatterns = _.isEmpty(userPatterns)
      ? ['./**/*.html']
      : userPatterns;
    return await findHostFiles(filePatterns, ['.html']);
  },

  prettierFix,
};

export default {
  run,
  fix,
};
