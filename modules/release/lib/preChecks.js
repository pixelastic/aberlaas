import Gilmore from 'gilmore';
import { run } from 'firost';

/**
 * Validate all pre-conditions before starting the release
 * @param {object} options Release options
 * @param {boolean} options.skipTest Skip test execution
 * @param {boolean} options.skipLint Skip lint execution
 * @returns {Promise<void>}
 */
async function validate(options = {}) {
  const gitRoot = await run('git rev-parse --show-toplevel');
  const repo = new Gilmore(gitRoot);

  // Check 1: On branch main
  const branch = await repo.currentBranchName();
  if (branch !== 'main') {
    throw new Error(
      `Must be on main branch (currently on: ${branch}). Switch with: git checkout main`,
    );
  }

  // Check 2: Working directory clean
  const changes = await repo.status();
  if (changes.length > 0) {
    throw new Error(
      'Working directory must be clean. Commit or stash your changes first.',
    );
  }

  // Check 3: npm authentication (check early!)
  try {
    await run('npm whoami');
  } catch (_error) {
    throw new Error('Not logged in to npm. Run: npm login');
  }

  // Check 4: Run tests (unless --skip-test)
  if (!options.skipTest) {
    console.log('Running tests...');
    const testModule = await import('aberlaas-test');
    await testModule.default();
  }

  // Check 5: Run lint (unless --skip-lint)
  if (!options.skipLint) {
    console.log('Running lint...');
    const lintModule = await import('aberlaas-lint');
    await lintModule.default();
  }
}

export default validate;
