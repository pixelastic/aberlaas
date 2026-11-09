import path from 'node:path';
import { _, pMap } from 'golgoth';
import { firostError, read } from 'firost';
import { findHostFiles, hostGitRoot } from 'aberlaas-helper';
import yamlLint from 'yaml-lint';
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
    const input = await read(filepath);
    try {
      await yamlLint.lint(input);
    } catch (error) {
      hasErrors = true;
      const relativePath = path.relative(hostGitRoot(), filepath);
      errorMessages.push(`Invalid YAML: ${relativePath}`);
      errorMessages.push(error.message);
    }
  });

  if (hasErrors) {
    throw firostError('ABERLAAS_LINT_YML', errorMessages.join('\n'));
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
    // The circleci linter owns .circleci/config.yml. It passes it explicitly, so
    // we only exclude it from the default patterns to avoid parallel read/write
    // races between the two linters
    const filePatterns = _.isEmpty(userPatterns)
      ? ['./**/*.yml', './**/*.yaml', '!./.circleci/config.yml']
      : userPatterns;
    return await findHostFiles(filePatterns, ['.yml', '.yaml']);
  },

  prettierFix,
};

export default {
  run,
  fix,
};
