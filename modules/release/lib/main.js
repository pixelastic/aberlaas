import path from 'node:path';
import { consoleInfo, run } from 'firost';
import { pMap } from 'golgoth';
import { ensureValidSetup } from './ensureValidSetup.js';
import { updateGitRepo } from './updateGitRepo.js';
import { getReleaseData } from './getReleaseData.js';

export const __ = {
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
        await __.run('npm publish --access public', { cwd: packageDir });
      },
      { concurrency: 1 },
    );
  },

  ensureValidSetup,
  updateGitRepo,
  getReleaseData,
  consoleInfo,
  run,
};

export default {
  /**
   * Wrapper to release the current module(s)
   * @param {object} cliArgs CLI Argument object, as created by minimist
   * @returns {boolean} True on success
   */
  async run(cliArgs = {}) {
    await __.ensureValidSetup(cliArgs);

    const releaseData = await __.getReleaseData(cliArgs);

    await __.updateGitRepo(releaseData);

    await __.publishAllPackagesToNpm(releaseData);
  },
};
