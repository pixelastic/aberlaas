import { _ } from 'golgoth';
import { consoleInfo, firostError } from 'firost';
import Gilmore from 'gilmore';
import { hostGitRoot } from 'aberlaas-helper';
import aberlaasTest from 'aberlaas-test';
import aberlaasLint from 'aberlaas-lint';
import { ensureNpmLogin } from './npm.js';

/**
 * Validate all pre-conditions before starting the release
 * @param {object} options Release options
 * @param {boolean} options.skipTest Skip test execution
 * @param {boolean} options.skipLint Skip lint execution
 * @returns {Promise<void>}
 */
export async function ensureValidRepository(options = {}) {
  const gitRoot = await hostGitRoot();
  const repo = new Gilmore(gitRoot);

  // Need to be on branch main
  await ensureCorrectBranch(repo);

  // Need to have a clean directory
  await ensureCleanRepository(repo);

  // Check npm login
  await ensureNpmLogin();

  // Check tests are passing
  if (!options.skipTest) {
    consoleInfo('Running tests...');
    await ensureTestsArePassing();
  }

  // Check lint is passing
  if (!options.skipLint) {
    consoleInfo('Running lint...');
    await ensureLintIsPassing();
  }
}

/**
 * Ensures the repository is on the main branch before allowing a release
 * @param {object} repo - The repository object with branch operations
 * @returns {Promise<boolean>} True if on main branch
 * @throws {Error} Throws ABERLAAS_RELEASE_NOT_ON_MAIN_BRANCH error if not on main branch
 */
async function ensureCorrectBranch(repo) {
  const currentBranch = await repo.currentBranchName();
  if (currentBranch == 'main') {
    return true;
  }
  throw firostError(
    'ABERLAAS_RELEASE_NOT_ON_MAIN_BRANCH',
    'You must be on branch main to release.',
  );
}

/**
 * Ensures the repository has no uncommitted changes before proceeding with operations
 * @param {object} repo - The repository object to check status on
 * @returns {Promise<boolean>} Returns true if repository is clean
 * @throws {Error} Throws ABERLAAS_RELEASE_NOT_CLEAN_DIRECTORY error if uncommitted changes exist
 */
async function ensureCleanRepository(repo) {
  const changes = await repo.status();
  if (_.isEmpty(changes)) {
    return true;
  }
  throw firostError(
    'ABERLAAS_RELEASE_NOT_CLEAN_DIRECTORY',
    'Your working directory must be clean, with no uncommitted changes.',
  );
}

/**
 * Ensures that all tests are passing before proceeding with a release
 * @returns {Promise<void>} A promise that resolves if tests pass, rejects with ABERLAAS_RELEASE_TESTS_FAILING error if tests fail
 */
async function ensureTestsArePassing() {
  try {
    await aberlaasTest.run({ failFast: true });
  } catch (err) {
    throw firostError('ABERLAAS_RELEASE_TESTS_FAILING', err.message);
  }
}

/**
 * Ensures that linting passes by running the lint process and throwing an error if it fails
 * @returns {Promise<void>} A promise that resolves if linting passes
 * @throws {Error} Throws ABERLAAS_RELEASE_LINT_FAILING error if linting fails
 */
async function ensureLintIsPassing() {
  try {
    await aberlaasLint.run();
  } catch (err) {
    throw firostError('ABERLAAS_RELEASE_LINT_FAILING', err.message);
  }
}
