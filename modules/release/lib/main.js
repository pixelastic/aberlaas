import { consoleInfo, run as firostRun } from 'firost';
import { ensureReleaseReady } from './ensureReleaseReady.js';
import { ensureRepositoryReady } from './ensureRepositoryReady.js';
import { getReleaseData } from './getReleaseData.js';
import { publishToNpm } from './publishToNpm.js';
import { updateGitRepo } from './updateGitRepo.js';

export let __;

/**
 * Wrapper to release the current module(s)
 * @param {object} cliArgs CLI Argument object, as created by minimist
 * @returns {boolean} True on success
 */
export async function run(cliArgs = {}) {
  // Repository-level checks (on main, clean, etc)
  await __.ensureRepositoryReady(cliArgs);
  // Release-dependent checks (loggued in to npm if needed, test, lint, correct files, etc)
  const releaseData = await __.getReleaseData(cliArgs);
  await __.ensureReleaseReady(cliArgs, releaseData);

  __.consoleInfo(`Release new version ${releaseData.newVersion}`);

  await __.updateGitRepo(releaseData);

  await __.publishToNpm(releaseData);
}

__ = {
  ensureRepositoryReady,
  ensureReleaseReady,
  getReleaseData,
  publishToNpm,
  updateGitRepo,
  consoleInfo,
  firostRun,
};

export default { run };
