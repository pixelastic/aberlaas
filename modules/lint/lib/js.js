import { _ } from 'golgoth';
import { firostError } from 'firost';
import { ESLint } from 'eslint';
import { findHostPackageFiles, getConfig } from 'aberlaas-helper';
import eslintConfig from '../configs/eslint.js';

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
  const options = { fix: false, warnIgnored: false, ...userOptions };

  // Files to lint
  const files = await __.getInputFiles(userPatterns);
  if (_.isEmpty(files)) {
    return true;
  }

  // Config file
  const config = await getConfig(
    userConfigFile,
    'eslint.config.js',
    eslintConfig,
  );

  // Run the actual lint
  const eslint = new ESLint({
    ...options,
    overrideConfigFile: true,
    overrideConfig: config,
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
  throw firostError('ABERLAAS_LINT_JS', errorText);
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
