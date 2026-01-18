import { _ } from 'golgoth';
import { consoleInfo, firostError } from 'firost';
import Gilmore from 'gilmore';
import { hostGitRoot } from 'aberlaas-helper';
import aberlaasTest from 'aberlaas-test';
import aberlaasLint from 'aberlaas-lint';
import { ensureNpmLogin } from './npm.js';

export const __ = {
  consoleInfo,
  /**
   * Validates that the provided bump type is one of the accepted semantic versioning types.
   * @param {object} cliArgs Release options
   * @returns {void} - Returns nothing if valid, throws error if invalid
   * @throws {Error} Throws ABERLAAS_RELEASE_UNKNOWN_BUMP_TYPE error if bumpType is not 'patch', 'minor', or 'major'
   */
  ensureCorrectBumpType(cliArgs) {
    const bumpType = cliArgs._[0];
    if (_.includes(['patch', 'minor', 'major'], bumpType)) {
      return true;
    }
    throw firostError(
      'ABERLAAS_RELEASE_UNKNOWN_BUMP_TYPE',
      'Bump type should be either major, minor or patch',
    );
  },

  /**
   * Ensures the repository is on the main branch before allowing a release
   * @param {object} repo - The repository object with branch operations
   * @returns {Promise<boolean>} True if on main branch
   * @throws {Error} Throws ABERLAAS_RELEASE_NOT_ON_MAIN_BRANCH error if not on main branch
   */
  async ensureCorrectBranch(repo) {
    const currentBranch = await repo.currentBranchName();
    if (currentBranch == 'main') {
      return true;
    }
    throw firostError(
      'ABERLAAS_RELEASE_NOT_ON_MAIN_BRANCH',
      'You must be on branch main to release.',
    );
  },

  /**
   * Ensures the repository has no uncommitted changes before proceeding with operations
   * @param {object} repo - The repository object to check status on
   * @returns {Promise<boolean>} Returns true if repository is clean
   * @throws {Error} Throws ABERLAAS_RELEASE_NOT_CLEAN_DIRECTORY error if uncommitted changes exist
   */
  async ensureCleanRepository(repo) {
    const changes = await repo.status();
    if (_.isEmpty(changes)) {
      return true;
    }
    throw firostError(
      'ABERLAAS_RELEASE_NOT_CLEAN_DIRECTORY',
      'Your working directory must be clean, with no uncommitted changes.',
    );
  },

  /**
   * Ensures that all tests are passing before proceeding with a release
   * @param {object} cliArgs Release options
   * @returns {Promise<void>} A promise that resolves if tests pass, rejects with ABERLAAS_RELEASE_TESTS_FAILING error if tests fail
   */
  async ensureTestsArePassing(cliArgs = {}) {
    if (cliArgs['skip-test']) {
      return false;
    }
    __.consoleInfo('Running tests...');
    try {
      await aberlaasTest.run({ failFast: true });
      return true;
    } catch (err) {
      throw firostError('ABERLAAS_RELEASE_TESTS_FAILING', err.message);
    }
  },

  /**
   * Ensures that linting passes by running the lint process and throwing an error if it fails
   * @param {object} cliArgs Release options
   * @returns {Promise<void>} A promise that resolves if linting passes
   * @throws {Error} Throws ABERLAAS_RELEASE_LINT_FAILING error if linting fails
   */
  async ensureLintIsPassing(cliArgs = {}) {
    if (cliArgs['skip-lint']) {
      return false;
    }
    __.consoleInfo('Running lint...');
    try {
      await aberlaasLint.run();
      return true;
    } catch (err) {
      throw firostError('ABERLAAS_RELEASE_LINT_FAILING', err.message);
    }
  },
};

/**
 * Validate all pre-conditions before starting the release
 * @param {object} cliArgs Release options
 * @param {boolean} cliArgs.skipTest Skip test execution
 * @param {boolean} cliArgs.skipLint Skip lint execution
 * @returns {Promise<void>}
 */
export async function ensureValidSetup(cliArgs = {}) {
  __.ensureCorrectBumpType(cliArgs);

  const repo = new Gilmore(hostGitRoot());

  // Need to be on branch main
  await __.ensureCorrectBranch(repo);

  // Need to have a clean directory
  await __.ensureCleanRepository(repo);

  // Check npm login
  await ensureNpmLogin();

  // Check tests are passing
  await __.ensureTestsArePassing(cliArgs);

  // Check lint is passing
  await __.ensureLintIsPassing(cliArgs);
}
