import { _ } from 'golgoth';
import { firostError, run } from 'firost';
import { getConfig } from 'aberlaas-helper';
import { ESLint } from 'eslint';
import eslintConfig from '../../configs/eslint/index.js';

/**
 * Lint all files and display results.
 * @param {Array} files Files to lint
 * @param {string} userConfigFile Custom config file to use
 * @param {object} userOptions Options to pass to ESLint, including fix
 * @returns {boolean} True on success
 */
export async function eslintRun(files, userConfigFile, userOptions = {}) {
  // Files
  if (_.isEmpty(files)) {
    return true;
  }

  // Config file
  const config = await getConfig(
    userConfigFile,
    'eslint.config.js',
    eslintConfig,
  );

  // Options
  const options = { fix: false, warnIgnored: false, ...userOptions };

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
  throw firostError('ABERLAAS_LINT_ESLINT', errorText);
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

export default {
  run,
  fix,
};
