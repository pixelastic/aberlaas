import path from 'node:path';
import { _, pMap } from 'golgoth';
import { firostError, read } from 'firost';
import { findHostPackageFiles, hostGitRoot } from 'aberlaas-helper';
import { prettierFix } from './helpers/prettierFix.js';

export let __;

/**
 * Lint all files and display results.
 * @param {Array} userPatterns Patterns to narrow the search down
 * @returns {boolean} True on success
 */
export async function run(userPatterns) {
  const files = await __.getInputFiles(userPatterns);
  if (_.isEmpty(files)) {
    return true;
  }

  let hasErrors = false;
  const errorMessages = [];
  await pMap(files, async (filepath) => {
    try {
      JSON.parse(await read(filepath));
    } catch (error) {
      hasErrors = true;
      const relativePath = path.relative(hostGitRoot(), filepath);
      errorMessages.push(`Invalid JSON: ${relativePath}`);
      errorMessages.push(error.message);
    }
  });

  if (hasErrors) {
    throw firostError('ABERLAAS_LINT_JSON', errorMessages.join('\n'));
  }
  return true;
}

/**
 * Autofix files in place
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
