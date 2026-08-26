import { consoleInfo, firostError } from 'firost';
import { yarnRun } from 'aberlaas-helper';
import { ensureCorrectPublishedFiles } from './ensureCorrectPublishedFiles.js';
import { ensureTrustedPublishing } from './ensureTrustedPublishing.js';

export let __;

/**
 * Validate data-dependent checks before proceeding with the release
 * @param {object} cliArgs Release options
 * @param {boolean} [cliArgs.test=true] Run test execution
 * @param {boolean} [cliArgs.lint=true] Run lint execution
 * @param {object} releaseData Release data from getReleaseData
 * @returns {Promise<void>}
 */
export async function ensureReleaseReady(cliArgs = {}, releaseData = {}) {
  // Default options: test and lint enabled unless explicitly disabled via CLI
  const options = {
    test: true,
    lint: true,
    ...cliArgs,
  };

  // Ensure trusted publishing is configured
  await __.ensureTrustedPublishing(releaseData);

  // Check tests are passing
  await __.ensureTestsArePassing(options);

  // Check lint is passing
  await __.ensureLintIsPassing(options);

  // Check published files
  await __.ensureCorrectPublishedFiles(releaseData);
}

__ = {
  /**
   * Ensures that all tests are passing before proceeding with a release
   * @param {object} options Release options
   * @param {boolean} [options.test=true] Run tests
   * @returns {Promise<void>} A promise that resolves if tests pass, rejects with ABERLAAS_RELEASE_TESTS_FAILING error if tests fail
   */
  async ensureTestsArePassing(options = {}) {
    if (!options.test) {
      return false;
    }
    __.consoleInfo('Running tests...');
    try {
      await __.yarnRun('test --fail-fast');
      return true;
    } catch (err) {
      throw firostError('ABERLAAS_RELEASE_TESTS_FAILING', err.message);
    }
  },

  /**
   * Ensures that linting passes by running the lint process and throwing an error if it fails
   * @param {object} options Release options
   * @param {boolean} [options.lint=true] Run lint
   * @returns {Promise<void>} A promise that resolves if linting passes
   * @throws {Error} Throws ABERLAAS_RELEASE_LINT_FAILING error if linting fails
   */
  async ensureLintIsPassing(options = {}) {
    if (!options.lint) {
      return false;
    }
    __.consoleInfo('Running lint...');
    try {
      await __.yarnRun('lint');
      return true;
    } catch (err) {
      throw firostError('ABERLAAS_RELEASE_LINT_FAILING', err.message);
    }
  },

  consoleInfo,
  ensureCorrectPublishedFiles,
  ensureTrustedPublishing,
  yarnRun,
};
