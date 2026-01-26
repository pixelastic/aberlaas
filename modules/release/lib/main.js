import path from 'node:path';
import { consoleInfo, glob, readJson, run } from 'firost';
import { _, pMap } from 'golgoth';
import { hostGitPath, hostGitRoot } from 'aberlaas-helper';
import semver from 'semver';
import { ensureValidSetup } from './ensureValidSetup.js';
import { updateGitRepo } from './updateGitRepo.js';

export const __ = {
  /**
   * Gathers all release information from CLI arguments
   * @param {object} cliArgs - CLI arguments from minimist
   * @returns {object} Release data containing bumpType, allPackages, currentVersion, newVersion, skipChangelog
   */
  async getReleaseData(cliArgs) {
    const bumpType = cliArgs._[0];
    const allPackages = await __.getAllPackagesToRelease();
    const currentVersion = allPackages[0].content.version;
    const newVersion = semver.inc(currentVersion, bumpType);
    const skipChangelog = !!cliArgs['skip-changelog'];

    return {
      bumpType,
      allPackages,
      currentVersion,
      newVersion,
      skipChangelog,
    };
  },

  /**
   * Gets all packages that need to be released
   * @returns {Array<{filepath: string, content: object}>} Array of packages with their filepath and content
   */
  async getAllPackagesToRelease() {
    const rootPackagePath = hostGitPath('package.json');
    const rootPackageContent = await readJson(rootPackagePath);
    const workspaces = rootPackageContent.workspaces;

    // If no workspaces, this is the package to publish
    if (!workspaces) {
      if (rootPackageContent.private) {
        return [];
      }
      return [
        {
          filepath: rootPackagePath,
          content: rootPackageContent,
        },
      ];
    }

    // If workspaces, we get the packages of all those workspaces
    const rootPath = hostGitRoot();
    const rawList = await pMap(workspaces, async (workspacePattern) => {
      const packagesPath = await glob(
        `${rootPath}/${workspacePattern}/package.json`,
      );
      const packagesData = await pMap(packagesPath, async (filepath) => {
        const content = await readJson(filepath);
        if (content.private) {
          return false;
        }
        return {
          filepath,
          content,
        };
      });
      return _.compact(packagesData);
    });

    return _.flatten(rawList);
  },

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

  updateGitRepo,
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
    await ensureValidSetup(cliArgs);

    const releaseData = await __.getReleaseData(cliArgs);

    await __.updateGitRepo(releaseData);
    await __.publishAllPackagesToNpm(releaseData);
  },
};
