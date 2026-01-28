import path from 'node:path';
import { pMap } from 'golgoth';
import { consoleInfo, run as firostRun } from 'firost';
import { ensureValidSetup } from './ensureValidSetup.js';
import { getReleaseData } from './getReleaseData.js';
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
  __.consoleInfo(`Release new version ${releaseData.newVersion}`);

  await __.updateGitRepo(releaseData);

  await __.publishAllPackagesToNpm(releaseData);
}

__ = {
  /**
   * Publishes all packages to npm
   * @param {object} releaseData - Release data containing allPackages
   */
  async publishAllPackagesToNpm(releaseData) {
    await pMap(
      releaseData.allPackages,
      async ({ filepath, content }) => {
        const packageName = content.name;
        __.consoleInfo(`Publishing ${packageName} to npm`);

        const packageDir = path.dirname(filepath);
        await __.firostRun('npm publish --access public', { cwd: packageDir });
      },
      { concurrency: 1 },
    );
  },

  ensureValidSetup,
  updateGitRepo,
  getReleaseData,
  consoleInfo,
  firostRun,
};

export default { run };
