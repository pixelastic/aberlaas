import { consoleInfo, run as firostRun } from 'firost';
import { ensureCorrectPublishedFiles } from './ensureCorrectPublishedFiles.js';
import { ensureValidSetup } from './ensureValidSetup.js';
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
  await __.ensureValidSetup(cliArgs);

  const releaseData = await __.getReleaseData(cliArgs);
  await __.ensureCorrectPublishedFiles(releaseData);

  __.consoleInfo(`Release new version ${releaseData.newVersion}`);

  await __.updateGitRepo(releaseData);

  await __.publishToNpm(releaseData);
}

__ = {
  ensureValidSetup,
  ensureCorrectPublishedFiles,
  getReleaseData,
  publishToNpm,
  updateGitRepo,
  consoleInfo,
  firostRun,
};

export default { run };
