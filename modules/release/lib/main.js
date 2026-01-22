import path from 'node:path';
import { consoleInfo, glob, readJson, run, writeJson } from 'firost';
import Gilmore from 'gilmore';
import { _, pMap } from 'golgoth';
import { hostGitPath, hostGitRoot } from 'aberlaas-helper';
import semver from 'semver';
import { ensureValidSetup } from './ensureValidSetup.js';
import { updateChangelog } from './changelog.js';

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
};

export default {
  /**
   * Wrapper to release the current module(s)
   * @param {object} cliArgs CLI Argument object, as created by minimist
   * @returns {boolean} True on success
   */
  async run(cliArgs = {}) {
    await ensureValidSetup(cliArgs);

    const bumpType = cliArgs._[0]; // major/minor/patch

    // Get all the packages to release and current version
    const allPackagesToRelease = await __.getAllPackagesToRelease();
    const currentVersion = allPackagesToRelease[0].content.version;
    const newVersion = semver.inc(currentVersion, bumpType);

    // Update the changelog
    if (!cliArgs['skip-changelog']) {
      await updateChangelog(currentVersion, newVersion);
    }

    // We bump the version of all packages
    await pMap(allPackagesToRelease, async ({ filepath, content }) => {
      const packageName = content.name;
      consoleInfo(`Updating ${packageName} to ${newVersion}`);
      const newContent = { ...content, version: newVersion };
      await writeJson(newContent, filepath, {
        sort: false,
      });
    });

    // Commit the changes
    const gitRoot = hostGitRoot();
    consoleInfo(`Creating new commit for version v${newVersion}`);
    const repo = new Gilmore(gitRoot);
    await repo.commitAll(`v${newVersion}`, { skipHook: true });

    // Publish all the packages
    await pMap(
      allPackagesToRelease,
      async ({ filepath, content }) => {
        const packageName = content.name;
        consoleInfo(`Publishing ${packageName} to npm`);

        const packageDir = path.dirname(filepath);
        await run('npm publish --access public', { cwd: packageDir });
      },
      { concurrency: 1 },
    );

    // We create a tag for this version
    await repo.createTag(`v${newVersion}`);

    // We push to the remote
    consoleInfo(`Creating tag v${newVersion} and pushing to repo`);
    await repo.push();
  },
};
