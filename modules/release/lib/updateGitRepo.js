import { pMap } from 'golgoth';
import { consoleInfo, writeJson } from 'firost';
import { hostGitRoot } from 'aberlaas-helper';
import Gilmore from 'gilmore';
import { updateChangelog } from './updateChangelog.js';

export let __;

/**
 * Update git repository with all changes for the release
 * @param {object} releaseData - Release data containing currentVersion, newVersion, skipChangelog, and allPackages
 */
export async function updateGitRepo(releaseData) {
  // Update CHANGELOG.md
  await __.updateChangelog(releaseData);

  // Update all .version keys in packages
  await __.bumpAllPackageVersions(releaseData);

  // Commit and push to remote
  await __.commitTagAndPush(releaseData);
}

__ = {
  /**
   * Bumps the version of all packages to the new version
   * @param {object} releaseData - Release data containing allPackages and newVersion
   */
  async bumpAllPackageVersions(releaseData) {
    const { newVersion } = releaseData;

    await pMap(releaseData.allPackages, async (packageData) => {
      const { filepath, content } = packageData;

      const newContent = { ...content, version: newVersion };
      await writeJson(newContent, filepath, {
        sort: false,
      });
    });
  },

  /**
   * Creates a commit, tag, and pushes to remote repository
   * @param {object} releaseData - Release data containing newVersion
   */
  async commitTagAndPush(releaseData) {
    const gitRoot = hostGitRoot();
    const repo = new Gilmore(gitRoot);

    // Create commit
    __.consoleInfo(
      `Creating new commit for version v${releaseData.newVersion}`,
    );
    await repo.commitAll(`v${releaseData.newVersion}`, { skipHook: true });

    // Create tag
    await repo.createTag(`v${releaseData.newVersion}`);

    // Push to remote
    __.consoleInfo('Pushing to remote repository');
    await repo.push();
  },

  consoleInfo,
  updateChangelog,
};
