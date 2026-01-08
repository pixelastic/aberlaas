import Gilmore from 'gilmore';
import { run } from 'firost';

let repo;

/**
 * Get or create Gilmore repo instance
 * @returns {Gilmore}
 */
function getRepo() {
  if (!repo) {
    repo = new Gilmore(process.cwd());
  }
  return repo;
}

/**
 * Create a temporary release branch
 * @param {string} version Version being released
 * @returns {Promise<string>} Branch name
 */
async function createTempBranch(version) {
  const repo = getRepo();
  const branchName = `temp/release-v${version}`;
  await repo.switchBranch(branchName);
  return branchName;
}

/**
 * Commit all release changes
 * @param {string} version Version being released
 * @returns {Promise<void>}
 */
async function commitRelease(version) {
  const repo = getRepo();
  await repo.add(); // Add all changes
  await repo.commit(
    `Release v${version}\n\n🤖 Generated with aberlaas release`,
  );
}

/**
 * Finalize the release: move main to release commit, tag, push
 * @param {string} version Version being released
 * @returns {Promise<void>}
 */
async function finalize(version) {
  const repo = getRepo();

  // Get current commit hash (on temp branch)
  const commitHash = await repo.currentCommit();

  // Switch back to main
  await repo.switchBranch('main');

  // Hard reset main to the release commit
  await repo.run(`reset --hard ${commitHash}`);

  // Create tag
  await repo.run(`tag v${version}`);

  // Push main and tags
  await repo.push();
  await repo.run('push --tags');

  // Delete temp branch
  const tempBranch = `temp/release-v${version}`;
  await repo.run(`branch -D ${tempBranch}`);
}

/**
 * Cleanup: delete temp branch and go back to main
 * @param {string} version Version that failed
 * @returns {Promise<void>}
 */
async function cleanup(version) {
  const repo = getRepo();

  // Switch back to main
  await repo.switchBranch('main');

  // Delete temp branch
  const tempBranch = `temp/release-v${version}`;
  await repo.run(`branch -D ${tempBranch}`);
}

export { createTempBranch, commitRelease, finalize, cleanup };
